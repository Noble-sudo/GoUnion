import mongoose from 'mongoose';
import { Group, User } from './src/models.js';

async function createGroup() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
  
  const group = await Group.create({
    name: 'Godfrey Okoye General',
    description: 'Welcome to the main campus circle for Godfrey Okoye University!',
    privacy: 'public',
    category: 'Student Life',
    creator_id: user.id,
    institution_id: 'ng-godfrey-okoye-university-enugu',
    is_active: true
  });
  
  console.log("Created fresh group:", group.name);
  process.exit(0);
}

createGroup();
