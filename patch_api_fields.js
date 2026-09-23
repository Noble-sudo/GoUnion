import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

const mapUpdate = `
                  privacy: g.privacy,
                  creatorId: g.creator_id || g.creatorId,
                  creator_id: g.creator_id || g.creatorId,
                  has_requested: g.has_requested,
                  category: g.category || 'Other',
`;

// Replace in both getAll and getById
content = content.replace(
  /privacy: g\.privacy,[\s\S]*?creatorId: g\.creator_id,/g,
  mapUpdate.trim()
);
content = content.replace(
  /privacy: g\.privacy,\s*\}\);/g,
  mapUpdate.trim() + '\n              });'
);


fs.writeFileSync('frontend/services/api.js', content);
console.log('Patched api.js to include category and has_requested');
