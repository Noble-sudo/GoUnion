import mongoose from 'mongoose';
import { User } from './src/models.js';

mongoose.connect('mongodb://127.0.0.1:27017/gounion').then(async () => {
  const res = await User.updateOne({ email: 'ezeilodavid292+gounion2@gmail.com' }, { $set: { role: 'admin' } });
  console.log('Update result:', res);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
