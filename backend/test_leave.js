import mongoose from 'mongoose';
import { Group, User } from './src/models.js';

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  const group = await Group.findOne({ name: 'GOUNI BASKETBALL' });
  
  if (!group) {
    console.log("Group not found");
    process.exit(1);
  }
  
  console.log("Group ID:", group.id);
  console.log("User ID:", user.id);
  
  const res = await fetch(`http://localhost:3000/api/groups/${group.id}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.id}` // Wait, how is auth passed? Usually cookies or a JWT.
    }
  });
  
  console.log(res.status);
  console.log(await res.text());
  
  process.exit(0);
}

test();
