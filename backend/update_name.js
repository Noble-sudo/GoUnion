import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { User } from './src/models.js';

mongoose.connect(env.mongoUri).then(async () => {
    const user = await User.findOne({ username: 'ezeilo2' });
    if (user && user.profile) {
        user.profile.full_name = 'Ezeilo';
        await user.save();
        console.log('Updated Ezeilo name');
    }
    process.exit(0);
});
