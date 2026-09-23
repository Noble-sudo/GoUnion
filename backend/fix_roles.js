import mongoose from 'mongoose';
import * as m from './src/models.js';

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const groups = await m.Group.find({});
  for (const group of groups) {
    if (group.creator_id) {
      await m.GroupMember.updateOne(
        { group_id: group.id, user_id: group.creator_id },
        { $set: { role: 'admin' } }
      );
    }
  }
  console.log('Fixed creator roles');
  process.exit(0);
}

fix();
