import mongoose from 'mongoose';
import { Post, User } from './src/models.js';

async function fixPosts() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
    
    const posts = await Post.find({ institution_id: { $eq: null } });
    console.log(`Found ${posts.length} posts with no institution_id`);
    
    for (const post of posts) {
        const creator = await User.findOne({ id: post.user_id });
        if (creator && creator.institution_id) {
            post.institution_id = creator.institution_id;
            await post.save();
            console.log(`Updated post by ${creator.username} to institution ${creator.institution_id}`);
        } else {
            post.institution_id = 'unn';
            await post.save();
            console.log(`Creator has no institution, assigned post to 'unn'`);
        }
    }
    
    console.log("Done");
    process.exit(0);
}

fixPosts();
