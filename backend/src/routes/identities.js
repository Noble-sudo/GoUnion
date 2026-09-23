import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { StudentIdentity, Institution } from '../models.js';

export const identitiesRouter = Router();

// 1. Request verification
identitiesRouter.post(
  '/request',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { institution_id, method, identifier, verification_data } = req.body;

    if (!institution_id || !method) {
      throw new HttpError(400, 'institution_id and method are required.');
    }

    let institution = await Institution.findOne({ id: institution_id });
    if (!institution) {
      // Lazy load from static list
      const { nigerianInstitutions } = await import('../data/nigerianInstitutions.js');
      const staticInst = nigerianInstitutions.find(i => i.id === institution_id);
      
      if (staticInst) {
        institution = await Institution.create({
          id: staticInst.id,
          name: staticInst.name,
          slug: staticInst.slug,
          status: 'active',
          verification_enabled: true,
          verification_methods: ['institutional_email', 'manual']
        });
      } else {
        throw notFound('Institution not found.');
      }
    }

    // Check if user already has a pending or verified identity here
    const existing = await StudentIdentity.findOne({
      user_id: req.user.id,
      institution_id,
      status: { $in: ['PENDING', 'VERIFIED'] }
    });

    if (existing) {
      throw new HttpError(409, 'You already have a pending or verified identity at this institution.');
    }

    // Check uniqueness (if identifier is provided)
    if (identifier) {
      const conflict = await StudentIdentity.findOne({
        institution_id,
        identifier: identifier.trim().toLowerCase(),
        status: { $in: ['VERIFIED'] }
      });
      if (conflict) {
        throw new HttpError(409, 'This student identifier is already registered to another account.');
      }
    }

    let initialStatus = 'PENDING';
    let needsAudit = false;
    let aiScore = null;

    if (method === 'institutional_email' && identifier) {
      if (identifier.trim().toLowerCase().endsWith('.edu.ng')) {
        initialStatus = 'VERIFIED';
        needsAudit = false; 
        aiScore = 100;
      }
    } else if (method === 'manual') {
      initialStatus = 'VERIFIED';
      needsAudit = true;
    }

    const identity = await StudentIdentity.create({
      user_id: req.user.id,
      institution_id,
      identifier: identifier ? identifier.trim().toLowerCase() : null,
      method,
      status: initialStatus,
      needs_audit: needsAudit,
      ai_confidence_score: aiScore,
      verification_data: verification_data || {},
    });
      
      // If the user doesn't have an active identity, set this as their active one (even if pending)
      // This allows them to bypass the onboarding screen and wait for approval.
      if (!req.user.active_identity_id) {
        req.user.active_identity_id = identity.id;
      req.user.institution_id = identity.institution_id;
      await req.user.save();
      }

    res.status(201).json({ status: 'PENDING', identity });
  })
);

// 2. Change active campus
identitiesRouter.post(
  '/change-campus',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { identity_id } = req.body;
    if (!identity_id) throw new HttpError(400, 'identity_id is required.');

    const identity = await StudentIdentity.findOne({ id: identity_id, user_id: req.user.id });
    if (!identity) throw notFound('Identity not found.');

    if (!['VERIFIED', 'LEGACY_UNVERIFIED'].includes(identity.status)) {
      throw new HttpError(403, 'You can only switch to a verified campus identity.');
    }

    req.user.active_identity_id = identity.id;
      req.user.institution_id = identity.institution_id;
      await req.user.save();

    res.json({ status: 'ok', active_identity_id: identity.id });
  })
);

// 3. Get my identities
identitiesRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const identities = await StudentIdentity.find({ user_id: req.user.id }).lean();
    
    // Attach institution names for convenience
    const instIds = identities.map(i => i.institution_id);
    const institutions = await Institution.find({ id: { $in: instIds } }).lean();
    const instMap = Object.fromEntries(institutions.map(i => [i.id, i.name]));

    res.json({
      active_identity_id: req.user.active_identity_id,
      identities: identities.map(i => ({
        ...i,
        institution_name: instMap[i.institution_id] || 'Unknown Institution'
      }))
    });
  })
);
