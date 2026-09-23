import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { Conversation } from './src/models.js';

mongoose.connect(env.mongoUri).then(async () => {
    const convs = await Conversation.find({ is_group: false }).lean();
    for (const c of convs) {
        console.log(`Conv: ${c.id}, Participants: ${c.participant_ids.join(', ')}`);
    }
    process.exit(0);
});
