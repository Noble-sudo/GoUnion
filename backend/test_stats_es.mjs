import mongoose from 'mongoose';
import { User, Post, Group, Report, Institution } from './backend/src/models.js';

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
    try {
        const [users, total_posts, total_groups, pending_reports, postsByInstitution, groupsByInstitution, institutions] = await Promise.all([
        User.find().select('institution_id profile.university').lean(),
        Post.countDocuments({ group_id: null, is_taken_down: { $ne: true } }),
        Group.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        Post.aggregate([{ $match: { group_id: null, is_taken_down: { $ne: true } } }, { $group: { _id: '$institution_id', count: { $sum: 1 } } }]),
        Group.aggregate([{ $group: { _id: '$institution_id', count: { $sum: 1 } } }]),
        Institution.find().lean(),
      ]);
      console.log('Success!', { users: users.length, total_posts, total_groups, pending_reports });
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit();
}

run();
