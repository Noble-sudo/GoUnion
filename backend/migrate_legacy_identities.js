import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gounion');
  const { User, StudentIdentity, Institution } = await import('./src/models.js');

  console.log('--- Enabling manual verification for all active institutions ---');
  await Institution.updateMany(
    { status: 'active' },
    { $set: { verification_enabled: true, verification_methods: ['manual'] } }
  );

  console.log('--- Migrating existing users to LEGACY_UNVERIFIED StudentIdentity ---');
  
  // Find users who do NOT have an active_identity_id
  const users = await User.find({ 
    $or: [
      { active_identity_id: { $exists: false } },
      { active_identity_id: null }
    ]
  });

  console.log(`Found ${users.length} users to migrate.`);
  
  let migrated = 0;
  for (const user of users) {
    const uniName = user.profile?.university;
    if (uniName && uniName !== 'University Student') {
      const institution = await Institution.findOne({ name: uniName });
      if (institution) {
        const identity = await StudentIdentity.create({
          user_id: user.id,
          institution_id: institution.id,
          method: 'legacy',
          status: 'LEGACY_UNVERIFIED',
          verified_at: null,
        });
        user.active_identity_id = identity.id;
        await user.save();
        migrated++;
      } else {
        console.log(`User ${user.username} has unknown university: ${uniName}. Skipping migration.`);
      }
    } else {
      console.log(`User ${user.username} has default or no university. Skipping.`);
    }
  }

  console.log(`Migration complete. Migrated ${migrated} users.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
