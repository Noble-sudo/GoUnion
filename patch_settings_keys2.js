import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Settings.jsx', 'utf8');

c = c.split("getToggle('notify_likes'").join("getToggle('post_likes'");
c = c.split("setToggle('notify_likes'").join("setToggle('post_likes'");
c = c.split("getToggle('notify_comments'").join("getToggle('post_comments'");
c = c.split("setToggle('notify_comments'").join("setToggle('post_comments'");
c = c.split("getToggle('notify_follows'").join("getToggle('new_followers'");
c = c.split("setToggle('notify_follows'").join("setToggle('new_followers'");
c = c.split("getToggle('notify_mentions'").join("getToggle('mentions'");
c = c.split("setToggle('notify_mentions'").join("setToggle('mentions'");
c = c.split("getToggle('notify_messages'").join("getToggle('direct_messages'");
c = c.split("setToggle('notify_messages'").join("setToggle('direct_messages'");

fs.writeFileSync('frontend/pages/Settings.jsx', c);
console.log("Patched Settings keys to match backend!");
