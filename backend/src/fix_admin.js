import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { User } from './models.js';

async function fixSuperAdmin() {
    await connectDatabase();
    const user = await User.findOne({ email: 'ezeilodavid292@gmail.com' });
    if (user) {
        user.is_active = true;
        user.suspension_reason = null;
        user.role = 'admin'; // ensure they are admin
        await user.save();
        console.log('Super Admin restored successfully.');
    } else {
        console.log('Super Admin not found!');
    }
    process.exit(0);
}

fixSuperAdmin();
