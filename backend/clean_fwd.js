import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { Message } from './src/models.js';

mongoose.connect(env.mongoUri).then(async () => {
    const messages = await Message.find({ content: { $regex: /^Forwarded/ } });
    for (const msg of messages) {
        let text = msg.content;
        text = text.replace(/^Forwarded from .*?:\n\n/, '');
        text = text.replace(/^Forwarded:\n\n/, '');
        text = text.replace(/^Forwarded:\s*/, '');
        msg.content = text;
        msg.is_forwarded = true;
        await msg.save();
    }
    console.log('Cleaned up', messages.length, 'forwarded messages');
    process.exit(0);
});
