export const ADMIN_EMAILS = [
  'ezeilodavid292@gmail.com',
  'ezeilodavid292+gounion2@gmail.com',
];

export const normalizeAdminEmail = (email = '') => String(email).trim().toLowerCase();

export const isAdminEmail = (email) => ADMIN_EMAILS.includes(normalizeAdminEmail(email));
