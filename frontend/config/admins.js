// Only the permanently-locked super admin has a hardcoded fallback.
// All other admin access is determined by user.role from the backend.
export const SUPER_ADMIN_EMAIL = 'ezeilodavid292@gmail.com';

export const normalizeAdminEmail = (email = '') => String(email).trim().toLowerCase();

export const isAdminEmail = (email) => normalizeAdminEmail(email) === SUPER_ADMIN_EMAIL;
