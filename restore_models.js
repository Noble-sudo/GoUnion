import fs from 'fs';

let content = fs.readFileSync('backend/src/models.js', 'utf8');

const institutionSchemaStr = `
const institutionSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    slug: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  baseOptions,
);
`;

const campusXP = `
const campusXPSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
  },
  baseOptions,
);

const campusStreakSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    streak: { type: Number, default: 0 },
  },
  baseOptions,
);
`;

// Insert after userSchema
content = content.replace(/const followSchema = new Schema\(/, institutionSchemaStr + campusXP + '\nconst followSchema = new Schema(');

// Add to exports
content = content.replace(/export const User = models\.User \|\| model\('User', userSchema\);/, `export const Institution = models.Institution || model('Institution', institutionSchema);
export const CampusXP = models.CampusXP || model('CampusXP', campusXPSchema);
export const CampusStreak = models.CampusStreak || model('CampusStreak', campusStreakSchema);
export const User = models.User || model('User', userSchema);`);

fs.writeFileSync('backend/src/models.js', content);
console.log("Restored missing models!");
