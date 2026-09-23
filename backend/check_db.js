import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { User, StudentIdentity } = await import('./backend/src/models.js');
  
  const users = await User.find({}, 'username institution_id active_identity_id').lean();
  console.log("Users:", users);
  
  const identities = await StudentIdentity.find({}, 'status user_id institution_id').lean();
  console.log("Identities:", identities);
  
  process.exit(0);
}

check().catch(console.error);
