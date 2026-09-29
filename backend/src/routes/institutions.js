import { Router } from 'express';
import { Institution } from '../models.js';
import { nigerianInstitutions } from '../data/nigerianInstitutions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const institutionsRouter = Router();

institutionsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();

    const institutions = await Institution.find({ status: 'active' })
      .sort({ name: 1 })
      .lean();

    const bySlug = new Map();
    nigerianInstitutions.forEach((institution) => bySlug.set(institution.slug, institution));
    institutions.forEach((institution) => {
      bySlug.set(institution.slug, {
        id: institution.id,
        name: institution.name,
        slug: institution.slug,
        logo: institution.logo,
        location: institution.location,
        type: institution.settings?.type || institution.type || 'Institution',
        status: institution.status,
        aliases: institution.aliases || [],
      });
    });

    let results = Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name));

    // If a search query is provided, filter by name, location, type, or aliases
    if (q) {
      results = results.filter((inst) => {
        const searchable = `${inst.name} ${inst.location} ${inst.type} ${(inst.aliases || []).join(' ')}`.toLowerCase();
        return searchable.includes(q);
      });
    }

    res.json(results);
  }),
);

institutionsRouter.get(
  '/active',
  asyncHandler(async (req, res) => {
    // Get institutions that have at least one user
    const User = (await import('../models.js')).User;
    const activeInstIds = await User.distinct('institution_id', { institution_id: { $ne: null } });
    
    const institutions = await Institution.find({ 
      id: { $in: activeInstIds },
      status: 'active' 
    }).lean();

    const byId = new Map();
    nigerianInstitutions.forEach((inst) => {
      if (activeInstIds.includes(inst.id)) {
        byId.set(inst.id, inst);
      }
    });
    
    institutions.forEach((inst) => {
      byId.set(inst.id, {
        id: inst.id,
        name: inst.name,
        slug: inst.slug,
        logoUrl: inst.logo,
        location: inst.location,
        type: inst.settings?.type || inst.type || 'Institution',
      });
    });

    const results = await Promise.all(Array.from(byId.values()).map(async (inst) => {
      const studentCount = await User.countDocuments({ institution_id: inst.id });
      return { ...inst, studentCount };
    }));

    res.json(results.sort((a, b) => b.studentCount - a.studentCount));
  })
);
