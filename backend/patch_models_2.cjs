const fs = require('fs');
let code = fs.readFileSync('src/models.js', 'utf8');

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

if (!code.includes('institution_id: { type: String, default: null')) {
  code = code.replace(/full_name: \{ type: String, default: '' \},/, 
    "full_name: { type: String, default: '' },\n    institution_id: { type: String, default: null, index: true },\n    institution_name: { type: String, default: '' },");
}

if (!code.includes("visibility: { type: String, enum: ['campus', 'connections', 'reconnected']")) {
  code = code.replace(/const postSchema = new Schema\(\s*\{\s*id: \{ type: String, unique: true, default: makeId, index: true \},\s*user_id: \{ type: String, required: true, index: true \},/,
    "const postSchema = new Schema({\n      id: { type: String, unique: true, default: makeId, index: true },\n      user_id: { type: String, required: true, index: true },\n      institution_id: { type: String, index: true },\n      visibility: { type: String, enum: ['campus', 'connections', 'reconnected'], default: 'campus', index: true },");
}

if (!code.includes('groupSchema = new Schema({\n    id: { type: String, unique: true, default: makeId, index: true },\n    institution_id')) {
  code = code.replace(/const groupSchema = new Schema\(\s*\{\s*id: \{ type: String, unique: true, default: makeId, index: true \},/,
    "const groupSchema = new Schema({\n    id: { type: String, unique: true, default: makeId, index: true },\n    institution_id: { type: String, index: true },");
}

fs.writeFileSync('src/models.js', code);
console.log('Patched models.js safely');
