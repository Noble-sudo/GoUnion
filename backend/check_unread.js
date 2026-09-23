import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gounion').then(async () => {
    console.log('Connected to DB');
    const Notification = mongoose.connection.collection('notifications');
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({}); // Getting the first user (likely David)
    
    console.log('Checking notifications for:', user.id, user.username);
    const unreadCount = await Notification.countDocuments({ user_id: user.id, is_read: false, type: { $ne: 'new_message' } });
    console.log('Unread Count:', unreadCount);

    const totalCount = await Notification.countDocuments({ user_id: user.id, type: { $ne: 'new_message' } });
    console.log('Total Count:', totalCount);

    const someNotifs = await Notification.find({ user_id: user.id }).sort({_id: -1}).limit(3).toArray();
    console.log('Sample Notifs:', someNotifs.map(n => ({ id: n.id, is_read: n.is_read, read: n.read, type: n.type })));

    process.exit(0);
});
