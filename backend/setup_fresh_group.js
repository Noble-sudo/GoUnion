import mongoose from 'mongoose';
import { Group, GroupMember, Conversation, User } from './src/models.js';

async function setupFreshGroup() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  const group = await Group.findOne({ name: 'Godfrey Okoye General' });
  
  await GroupMember.create({ group_id: group.id, user_id: user.id, role: 'admin' });
  
  await Conversation.create({
      name: group.name,
      group_id: group.id,
      participant_ids: [user.id],
      participant_key: 'group_' + group.id
  });
  
  console.log("Setup complete for", group.name);
  process.exit(0);
}

setupFreshGroup();
