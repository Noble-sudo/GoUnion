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
