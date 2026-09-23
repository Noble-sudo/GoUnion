const fs = require('fs');
let c = fs.readFileSync('backend/src/store.js', 'utf8');

c = c.replace(
    "export const ensureSeedAdmin = async () => {\n  const seedAdminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';\n  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gounion.test';\n  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';\n  const existing = await User.findOne({ email: seedAdminEmail });\n  if (existing) return existing;\n\n  const user = await User.create({\n    username: seedAdminUsername,\n    email: seedAdminEmail,\n    password_hash: await bcrypt.hash(seedAdminPassword, 10),\n    is_active: true,\n    role: 'admin',\n    profile: {\n      full_name: 'GoUnion Admin',\n      bio: 'Campus community admin',\n      university: 'GoUnion University',\n    },\n  });\n  user.profile.user_id = user.id;\n  await user.save();\n  return user;\n};",
    "export const ensureSeedAdmin = async () => { return null; };"
);

fs.writeFileSync('backend/src/store.js', c);
