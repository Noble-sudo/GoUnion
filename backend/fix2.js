import mongoose from 'mongoose';
import * as m from './src/models.js';

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  
  await m.Group.updateMany(
    { name: /SPORT/i },
    { $set: { category: 'Sports' } }
  );

  await m.Group.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'Other' } }
  );

  const groups = await m.Group.find({}, 'name category');
  console.log(groups);
  process.exit(0);
}

fix();
