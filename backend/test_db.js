import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { Conversation, User } from './src/models.js';

mongoose.connect(env.mongoUri).then(async () => {
    const elon = await User.findOne({ username: 'elon musk' });
    const ezeilo = await User.findOne({ username: 'ezeilo2' });
    const goat = await User.findOne({ username: 'goat' });
    
    console.log('Elon:', elon.id);
    console.log('Ezeilo:', ezeilo.id);
    console.log('Goat:', goat.id);
    
    const participantIds = [elon.id, ezeilo.id].sort();
    console.log('Key:', participantIds.join(':'));
    
    const conv = await Conversation.findOne({
      participant_ids: { $all: [elon.id, ezeilo.id], $size: 2 }
    });
    console.log('Conv with Ezeilo:', conv ? conv.id : 'None');
    
    const convGoat = await Conversation.findOne({
      participant_ids: { $all: [elon.id, goat.id], $size: 2 }
    });
    console.log('Conv with Goat:', convGoat ? convGoat.id : 'None');

    process.exit(0);
});
