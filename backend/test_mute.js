import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gounion').then(async () => {
    console.log('Connected to DB');
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({});
    console.log(user.muted_conversations);
    process.exit(0);
});
