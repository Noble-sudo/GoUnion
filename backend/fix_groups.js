import mongoose from 'mongoose';
import { Group, User } from './src/models.js';

async function fixGroups() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
    
    const groups = await Group.find({ institution_id: { $eq: null } });
    console.log(`Found ${groups.length} groups with no institution_id`);
    
    for (const group of groups) {
        const creator = await User.findOne({ id: group.creator_id });
        if (creator && creator.institution_id) {
            group.institution_id = creator.institution_id;
            await group.save();
            console.log(`Updated group ${group.name} to institution ${creator.institution_id}`);
        } else {
            // Assign to UNN or UNILAG as fallback so it shows up for testing
            group.institution_id = 'unn';
            await group.save();
            console.log(`Creator has no institution, assigned ${group.name} to 'unn'`);
        }
    }
    
    console.log("Done");
    process.exit(0);
}

fixGroups();
