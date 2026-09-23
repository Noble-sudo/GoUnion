import mongoose from 'mongoose';
import { Group, User, StudentIdentity } from './src/models.js';

mongoose.connect('mongodb://127.0.0.1:27017/gounion')
  .then(async () => {
    console.log('Connected. Backfilling groups...');
    
    const groups = await Group.find({ institution_id: { $in: [null, ''] } });
    let updated = 0;
    
    for (const group of groups) {
      const creator = await User.findOne({ id: group.creator_id });
      if (creator && creator.active_identity_id) {
        const identity = await StudentIdentity.findOne({ id: creator.active_identity_id });
        if (identity) {
          group.institution_id = identity.institution_id;
          await group.save();
          updated++;
          continue;
        }
      }
      
      // If no valid creator identity found, maybe check their legacy profile university?
      if (creator && creator.profile?.university && creator.profile.university !== 'University Student') {
        const instName = creator.profile.university;
        const Institution = (await import('./src/models.js')).Institution;
        const inst = await Institution.findOne({ name: instName });
        if (inst) {
          group.institution_id = inst.id;
          await group.save();
          updated++;
          continue;
        }
      }
    }
    
    console.log(`Updated ${updated} groups.`);
    process.exit(0);
  });
