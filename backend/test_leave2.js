import mongoose from 'mongoose';
import { Group, GroupMember, Conversation, Message, User } from './src/models.js';

async function testLeave() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const group = await Group.findOne({ name: 'GOUNI BASKETBALL' });
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  
  if (!group || !user) {
    console.log("Not found");
    process.exit(1);
  }
  
  try {
      console.log("Removing from GroupMember");
      const r1 = await GroupMember.deleteOne({ group_id: group.id, user_id: user.id });
      console.log(r1);
      
      console.log("Removing from Conversation");
      const conv = await Conversation.findOne({ group_id: group.id });
      if (conv) {
        console.log("Before:", conv.participant_ids);
        conv.participant_ids = conv.participant_ids.filter(id => String(id) !== String(user.id));
        await conv.save();
        console.log("After:", conv.participant_ids);
      }
      
      console.log("System Message");
      const userName = user.profile?.full_name || user.username;
      
      let conv2 = await Conversation.findOne({ group_id: group.id });
      if (!conv2) {
          console.log("Creating conv");
        const grp = await Group.findOne({ id: group.id });
        const members = await GroupMember.find({ group_id: grp.id });
        conv2 = await Conversation.create({
          name: grp.name,
          group_id: grp.id,
          participant_ids: members.map(m => m.user_id),
          participant_key: 'group_' + grp.id
        });
      }
      
      console.log("Creating msg");
      await Message.create({
        conversation_id: conv2.id,
        sender_id: 'system',
        content: `${userName} left the circle`
      });
      
      console.log("Success");
  } catch (e) {
      console.error(e);
  }
  
  process.exit(0);
}

testLeave();
