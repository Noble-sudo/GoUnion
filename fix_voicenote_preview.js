const fs = require('fs');

let c = fs.readFileSync('frontend/services/api.js', 'utf8');

c = c.replace(
  /lastMessage\?\.video_url \? 'Video' : lastMessage\?\.image_url \? 'Attachment' : 'No messages yet'/,
  "lastMessage?.audio_url || (lastMessage?.image_url && lastMessage.image_url.match(/\\\\.(mp3|wav|ogg|webm|m4a)$/i)) ? 'Voice Note' : (lastMessage?.video_url ? 'Video' : lastMessage?.image_url ? 'Attachment' : 'No messages yet')"
);

fs.writeFileSync('frontend/services/api.js', c);
console.log('Fixed voice note preview text');
