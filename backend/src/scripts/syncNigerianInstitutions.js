import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Institution } from '../models.js';
import { nigerianInstitutions } from '../data/nigerianInstitutions.js';

const sources = [
  { url: 'https://enuc.nuc.edu.ng/nus', type: 'University', parser: 'nuc' },
  { url: 'https://ncce.gov.ng/AccreditedColleges', type: 'College of Education', parser: 'genericTable' },
  { url: 'https://www.nbte.gov.ng/nbte/directory', type: 'Polytechnic / TVET', parser: 'genericTable' },
  { url: 'https://mail.nbte.gov.ng/nbte/approved%20institutions', type: 'Polytechnic / TVET', parser: 'genericTable' },
];

const slugify = (value) => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const decodeHtml = (value = '') => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/&rsquo;/g, "'")
  .replace(/&lsquo;/g, "'")
  .replace(/&ndash;/g, '-')
  .replace(/&mdash;/g, '-')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const fetchWithRetry = async (url, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Reconnected institution sync' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
  throw lastError;
};

const inferState = (value = '') => {
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ];
  const found = states.find((state) => new RegExp(`\\b${state}\\b`, 'i').test(value));
  return found === 'Abuja' ? 'FCT Abuja' : found || '';
};

const normalizeInstitution = ({ name, state, type, ownership }) => {
  const cleanName = decodeHtml(name)
    .replace(/\bOPEN\b$/i, '')
    .replace(/\s+,/g, ',')
    .trim();
  if (!cleanName || cleanName.length < 4) return null;
  if (/^(s\/?n|name|website|provost|ownership|downloads|contact us)$/i.test(cleanName)) return null;
  const slug = slugify(cleanName);
  if (!slug) return null;
  const locationState = state || inferState(cleanName);
  return {
    id: `ng-${slug}`,
    name: cleanName,
    slug,
    location: locationState ? `${locationState}, Nigeria` : 'Nigeria',
    type: type || 'Institution',
    settings: { ownership: ownership || undefined, source: 'official-sync' },
    status: 'active',
  };
};

const parseNuc = (html) => {
  const records = [];
  const buttonRegex = /<button\b[^>]*class="[^"]*view-details[^"]*"[^>]*>/gi;
  const attrRegex = /data-([a-z-]+)="([^"]*)"/gi;
  const buttons = html.match(buttonRegex) || [];
  buttons.forEach((button) => {
    const attrs = {};
    let match;
    while ((match = attrRegex.exec(button))) {
      attrs[match[1]] = decodeHtml(match[2]);
    }
    const item = normalizeInstitution({
      name: attrs.name,
      state: attrs.state,
      type: 'University',
      ownership: attrs.ownership,
    });
    if (item) records.push(item);
  });
  return records;
};

const parseGenericTable = (html, fallbackType) => {
  const records = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html))) {
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      cells.push(decodeHtml(cellMatch[1]));
    }
    if (cells.length < 2) continue;
    const likelyName = cells.find((cell) => /university|polytechnic|college|monotechnic|institute|school/i.test(cell));
    if (!likelyName) continue;
    const type = /college/i.test(likelyName) ? 'College of Education' : fallbackType;
    const item = normalizeInstitution({ name: likelyName, state: inferState(cells.join(' ')), type });
    if (item) records.push(item);
  }
  return records;
};

const sync = async () => {
  const bySlug = new Map(nigerianInstitutions.map((institution) => [institution.slug, {
    ...institution,
    settings: { source: 'bundled' },
  }]));

  for (const source of sources) {
    try {
      const html = await fetchWithRetry(source.url);
      const records = source.parser === 'nuc'
        ? parseNuc(html)
        : parseGenericTable(html, source.type);
      records.forEach((record) => bySlug.set(record.slug, {
        ...bySlug.get(record.slug),
        ...record,
        settings: { ...(bySlug.get(record.slug)?.settings || {}), ...(record.settings || {}), source_url: source.url },
      }));
      console.log(`Parsed ${records.length} institutions from ${source.url}`);
    } catch (error) {
      console.warn(`Unable to sync ${source.url}: ${error.message}`);
    }
  }

  const records = Array.from(bySlug.values());
  if (process.argv.includes('--dry-run')) {
    console.log(`Dry run parsed ${records.length} Nigerian institutions.`);
    console.log(records.slice(0, 10).map((item) => `${item.name} | ${item.location} | ${item.type}`).join('\n'));
    return;
  }

  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to sync institutions.');
  }

  await mongoose.connect(env.mongoUri);
  await Promise.all(records.map((institution) => Institution.updateOne(
    { slug: institution.slug },
    { $set: institution },
    { upsert: true },
  )));
  await mongoose.disconnect();
  console.log(`Synced ${records.length} Nigerian institutions.`);
};

sync().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
