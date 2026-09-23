import mongoose from 'mongoose';
import { Group, User, StudentIdentity } from './src/models.js';
import { institutionScopedQuery, userInstitutionId } from './src/utils/institutionScope.js';

async function testAsUser() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  
  // Simulate auth middleware for test@gounion.com
  const user = await User.findOne({ email: 'test@gounion.com' });
  console.log('User raw institution_id:', user.institution_id);
  console.log('User active_identity_id:', user.active_identity_id);
  
  // Replicate auth middleware logic
  if (user.active_identity_id) {
    const identity = await StudentIdentity.findOne({ id: user.active_identity_id }).lean();
    console.log('Identity:', identity?.institution_id, identity?.status);
    if (identity && ['VERIFIED', 'LEGACY_UNVERIFIED'].includes(identity.status)) {
      user.institution_id = identity.institution_id;
    } else {
      user.institution_id = null;
    }
  }
  
  console.log('Final institution_id:', user.institution_id);
  console.log('userInstitutionId:', userInstitutionId(user));
  
  const query = institutionScopedQuery(user, { is_active: true });
  console.log('Query:', JSON.stringify(query));
  
  const groups = await Group.find(query).sort({ created_at: -1 });
  console.log('Groups found:', groups.length);
  groups.forEach(g => console.log(' -', g.name, '| inst:', g.institution_id, '| is_active:', g.is_active));
  
  // Also check raw without scoping
  const allGroups = await Group.find({ institution_id: 'ng-godfrey-okoye-university-enugu' });
  console.log('\nAll godfrey okoye groups (unscoped):', allGroups.length);
  allGroups.forEach(g => console.log(' -', g.name, '| is_active:', g.is_active));

  process.exit(0);
}

testAsUser();
