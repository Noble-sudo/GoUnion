import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Settings.jsx', 'utf8');

const replacements = {
    "getToggle('notify_likes'": "getToggle('post_likes'",
    "setToggle('notify_likes'": "setToggle('post_likes'",
    "getToggle('notify_comments'": "getToggle('post_comments'",
    "setToggle('notify_comments'": "setToggle('post_comments'",
    "getToggle('notify_follows'": "getToggle('new_followers'",
    "setToggle('notify_follows'": "setToggle('new_followers'",
    "getToggle('notify_mentions'": "getToggle('mentions'",
    "setToggle('notify_mentions'": "setToggle('mentions'",
    "getToggle('notify_messages'": "getToggle('direct_messages'",
    "setToggle('notify_messages'": "setToggle('direct_messages'",
};

for (const [search, replace] of Object.entries(replacements)) {
    c = c.replace(new RegExp(search.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace);
}

fs.writeFileSync('frontend/pages/Settings.jsx', c);
console.log("Patched Settings keys to match backend!");
