const fs = require('fs');
let code = fs.readFileSync('src/models.js', 'utf8');

// Add Institution model
if (!code.includes('const institutionSchema')) {
  const institutionSchemaCode = `
const institutionSchema = new Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, default: null },
    type: { type: String, default: null },
    logo: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  baseOptions,
);
export const Institution = models.Institution || model('Institution', institutionSchema);
`;
  code = code.replace('export const User = models.User', institutionSchemaCode + '\nexport const User = models.User');
}

// Add institution_id to User
if (!code.includes('institution_id: { type: String, default: null')) {
  code = code.replace(/full_name: \{ type: String, default: '' \},/g, 
    "full_name: { type: String, default: '' },\n    institution_id: { type: String, default: null, index: true },\n    institution_name: { type: String, default: '' },");
}

// Add institution_id and visibility to Post
if (!code.includes("visibility: { type: String, enum: ['campus', 'connections', 'reconnected']")) {
  code = code.replace(/user_id: \{ type: String, required: true, index: true \},/g,
    "user_id: { type: String, required: true, index: true },\n      institution_id: { type: String, index: true },\n      visibility: { type: String, enum: ['campus', 'connections', 'reconnected'], default: 'campus', index: true },");
}

// Add institution_id to Group
if (!code.includes('groupSchema = new Schema({\n    id: { type: String, unique: true, default: makeId, index: true },\n    institution_id')) {
  code = code.replace(/groupSchema = new Schema\(\s*\{\s*id: \{ type: String, unique: true, default: makeId, index: true \},/g,
    "groupSchema = new Schema({\n    id: { type: String, unique: true, default: makeId, index: true },\n    institution_id: { type: String, index: true },");
}

fs.writeFileSync('src/models.js', code);
console.log('Patched models.js');
