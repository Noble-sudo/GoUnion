const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

const messageRegex = /const message = await Message\.create\(\{[\s\S]*?\}\);\s*conversation\.updated_at = new Date\(\);\s*await conversation\.save\(\);/;

const inject = `const message = await Message.create({
      conversation_id: conversation.id,
      sender_id: req.user.id,
      content: req.body.content || '',
      image_url: req.body.image_url || null,
      video_url: req.body.video_url || null,
      audio_url: req.body.audio_url || null,
      sticker_url: req.body.sticker_url || null,
      sticker_id: req.body.sticker_id || null,
        reply_to_id: req.body.reply_to_id || null,
        is_forwarded: req.body.is_forwarded || false,
        is_read: false,
    });
    conversation.updated_at = new Date();
    await conversation.save();
    
    if (req.body.content) {
        await processMentions(req.body.content, req.user.id, { conversation_id: conversation.id });
    }`;

// Check if already injected
if (!content.includes('await processMentions(req.body.content')) {
    content = content.replace(
        /const message = await Message\.create\(\{[\s\S]*?\}\);\s*conversation\.updated_at = new Date\(\);\s*await conversation\.save\(\);/,
        inject
    );
    fs.writeFileSync('backend/src/routes/conversations.js', content);
    console.log('Added processMentions to conversations.js');
}
