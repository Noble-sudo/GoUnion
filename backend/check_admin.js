import mongoose from 'mongoose';
import * as m from './src/models.js';

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await m.User.findOne({ id: '8VrRt1SBerJ6' });
  console.log(user ? user.username + ' (' + user.email + ')' : 'User not found');
  process.exit(0);
}

check();
