import mongoose from 'mongoose';
import { Group, Conversation, User } from './src/models.js';

async function addAdminToConvos() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  const groups = await Group.find({ institution_id: 'ng-godfrey-okoye-university-enugu' });
  
  for (const group of groups) {
    const conv = await Conversation.findOne({ group_id: group.id });
    if (conv && !conv.participant_ids.includes(user.id)) {
      conv.participant_ids.push(user.id);
      await conv.save();
    } else if (!conv) {
        await Conversation.create({
            name: group.name,
            group_id: group.id,
            participant_ids: [user.id],
            participant_key: 'group_' + group.id
        });
    }
  }
  
  console.log("Added user to all Godfrey Okoye conversations");
  process.exit(0);
}

addAdminToConvos();
