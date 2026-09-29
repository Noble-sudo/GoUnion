import { Post, Story, User, Group } from './src/models.js';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const posts = await Post.find({ institution_id: null });
  let pCount = 0;
  for (const p of posts) {
    const u = await User.findOne({ id: p.user_id });
    if (u && u.institution_id) {
       p.institution_id = u.institution_id;
       await p.save();
       pCount++;
    }
  }
  console.log('Fixed', pCount, 'posts');

  const stories = await Story.find({ institution_id: null });
  let sCount = 0;
  for (const s of stories) {
    const u = await User.findOne({ id: s.user_id });
    if (u && u.institution_id) {
       s.institution_id = u.institution_id;
       await s.save();
       sCount++;
    }
  }
  console.log('Fixed', sCount, 'stories');

  const groups = await Group.find({ institution_id: null });
  let gCount = 0;
  for (const g of groups) {
    const u = await User.findOne({ id: g.creatorId });
    if (u && u.institution_id) {
       g.institution_id = u.institution_id;
       await g.save();
       gCount++;
    }
  }
  console.log('Fixed', gCount, 'groups');

  process.exit(0);
}

run().catch(console.error);
