const fs = require('fs');
let content = fs.readFileSync('backend/src/models.js', 'utf8');

// 1. Update institutionSchema
const instReplacement = `const institutionSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    slug: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    verification_enabled: { type: Boolean, default: false },
    verification_methods: { type: [String], default: ['manual'] },
    email_domains: { type: [String], default: [] },
  },
  baseOptions,
);`;
content = content.replace(/const institutionSchema = new Schema\([\s\S]*?baseOptions,\n\);/, instReplacement);

// 2. Add studentIdentitySchema right before userSchema
const identitySchema = `const studentIdentitySchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    user_id: { type: String, required: true, index: true },
    institution_id: { type: String, required: true, index: true },
    identifier: { type: String, default: null }, // e.g. email or matric number
    method: { type: String, required: true, enum: ['institutional_email', 'manual', 'legacy', 'student_portal'] },
    status: { type: String, required: true, enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'REVOKED', 'LEGACY_UNVERIFIED'] },
    verification_data: { type: Schema.Types.Mixed, default: {} },
    verified_at: { type: Date, default: null },
  },
  baseOptions,
);
// Ensure we don't have multiple people claiming the same exact verified identifier at the same institution
studentIdentitySchema.index(
  { institution_id: 1, identifier: 1 },
  { unique: true, partialFilterExpression: { identifier: { $type: "string", $ne: null } } }
);

`;

if (!content.includes('const studentIdentitySchema')) {
  content = content.replace('const userSchema = new Schema(', identitySchema + 'const userSchema = new Schema(');
}

// 3. Update userSchema to add active_identity_id
if (!content.includes('active_identity_id:')) {
  content = content.replace(
    /role: \{ type: String, enum: \['user', 'moderator', 'admin'\], default: 'user' \},/,
    `role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },\n    active_identity_id: { type: String, default: null, index: true },`
  );
}

// 4. Export StudentIdentity
if (!content.includes('StudentIdentity =')) {
  content = content.replace(
    /export const User = models\.User \|\| model\('User', userSchema\);/,
    `export const StudentIdentity = models.StudentIdentity || model('StudentIdentity', studentIdentitySchema);\nexport const User = models.User || model('User', userSchema);`
  );
}

fs.writeFileSync('backend/src/models.js', content);
console.log('models.js patched successfully');
