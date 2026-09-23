import mongoose from 'mongoose';
import { Group, GroupMember, User } from './src/models.js';

async function addAdminToGroups() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  const groups = await Group.find({ institution_id: 'ng-godfrey-okoye-university-enugu' });
  
  for (const group of groups) {
    await GroupMember.updateOne(
      { group_id: group.id, user_id: user.id },
      { $set: { role: 'admin' } },
      { upsert: true }
    );
  }
  
  console.log("Added user to all Godfrey Okoye groups");
  process.exit(0);
}

addAdminToGroups();
