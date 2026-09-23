import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function backfill() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { User, StudentIdentity } = await import('./src/models.js');
  
  const users = await User.find({ institution_id: null, active_identity_id: { $ne: null } });
  let count = 0;
  for (const user of users) {
    const identity = await StudentIdentity.findOne({ id: user.active_identity_id });
    if (identity && (identity.status === 'VERIFIED' || identity.status === 'LEGACY_UNVERIFIED')) {
      user.institution_id = identity.institution_id;
      await user.save();
      count++;
    }
  }
  
  console.log(\`Backfilled \${count} users with institution_id\`);
  process.exit(0);
}

backfill().catch(console.error);
