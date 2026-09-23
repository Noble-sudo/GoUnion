import { Institution, StudentIdentity } from '../models.js';
import { nigerianInstitutions } from '../data/nigerianInstitutions.js';
import { forbidden } from './httpError.js';

const normalizeInstitutionName = (value) => String(value || '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\b(university|college|polytechnic|institute|school|of|the|and|at|in)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const compactInstitutionName = (value) => normalizeInstitutionName(value).replace(/\s+/g, '');

const bundledById = new Map(nigerianInstitutions.map((institution) => [institution.id, institution]));
const bundledBySlug = new Map(nigerianInstitutions.map((institution) => [institution.slug, institution]));
const bundledByName = new Map(nigerianInstitutions.map((institution) => [normalizeInstitutionName(institution.name), institution]));
const bundledByCompactName = new Map(nigerianInstitutions.map((institution) => [compactInstitutionName(institution.name), institution]));

export const resolveInstitutionSelection = async ({ institutionId = null, institutionName = '' } = {}) => {
  const id = institutionId ? String(institutionId) : null;
  const name = String(institutionName || '').trim();

  if (id) {
    const institution = await Institution.findOne({ id, status: 'active' }).lean();
    if (institution) return { id: institution.id, name: institution.name };
    const bundled = bundledById.get(id) || bundledBySlug.get(id);
    if (bundled) return { id: bundled.id, name: bundled.name };
  }

  if (!name) return null;

  const normalizedName = normalizeInstitutionName(name);
  const compactName = compactInstitutionName(name);
  const bundled = bundledByName.get(normalizedName) || bundledByCompactName.get(compactName);
  if (bundled) return { id: bundled.id, name: bundled.name };

  const institutions = await Institution.find({ status: 'active' }).select('id name slug').lean();
  return institutions.find((institution) => {
    const candidate = normalizeInstitutionName(institution.name);
    const compactCandidate = compactInstitutionName(institution.name);
    return candidate === normalizedName || compactCandidate === compactName || institution.slug === id;
  }) || null;
};

// Deprecated, but left for safety
export const backfillUserInstitution = async (user) => {
  return user;
};

export const userInstitutionId = (user) => user?.institution_id || null;

export const institutionScopedQuery = (user, extra = {}) => {
  

  const institutionId = userInstitutionId(user);
  
  // If the user is pending/rejected and not an admin, they should see NO campus content.
  if (!institutionId) {
    return {
      ...extra,
      institution_id: '__locked_pending_user__'
    };
  }

  // Normal verified user: sees only their campus content.
  // We also include null/empty for backward compatibility with very old posts, 
  // but strictly speaking they should only see their institutionId.
  return {
    ...extra,
    institution_id: institutionId,
  };
};

export const assertSameInstitution = (resource, user, label = 'Resource') => {
  if (user && ['admin', 'moderator'].includes(user.role)) return; // Admins can bypass

  const resourceInstitutionId = resource?.institution_id || null;
  const institutionId = userInstitutionId(user);

  if (!institutionId) {
    throw forbidden(`${label} is locked until verification is complete.`);
  }

  if (resourceInstitutionId && resourceInstitutionId !== institutionId) {
    throw forbidden(`${label} belongs to another campus.`);
  }
};
