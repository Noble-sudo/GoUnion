import mongoose from 'mongoose';
import { Group, User } from './src/models.js';
import { institutionScopedQuery } from './src/utils/institutionScope.js';

async function testGetGroups() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  
  const query = institutionScopedQuery(user, { is_active: true });
  console.log("Query:", query);
  
  const groups = await Group.find(query).sort({ created_at: -1 });
  console.log("Found groups count:", groups.length);
  groups.forEach(g => console.log(g.name, g.institution_id));
  
  process.exit(0);
}

testGetGroups();
