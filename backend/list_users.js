import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { User } from './src/models.js';

mongoose.connect(env.mongoUri).then(async () => {
    const users = await User.find({}).lean();
    for (const u of users) {
        console.log(`Username: ${u.username}, ID: ${u.id}, Email: ${u.email}`);
        if (u.profile) {
             console.log(`   Full Name: ${u.profile.full_name}, Pic: ${u.profile.profile_picture}`);
        }
    }
    process.exit(0);
});
