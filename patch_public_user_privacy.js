import fs from 'fs';

let c = fs.readFileSync('backend/src/store.js', 'utf8');

const regex = /is_online: plain\.is_online,\s*last_seen: plain\.last_seen,/;

const replaceStr = `is_online: plain.settings?.show_online_status === false ? false : plain.is_online,
    last_seen: plain.settings?.show_last_seen === false ? null : plain.last_seen,`;

if (c.match(regex)) {
    c = c.replace(regex, replaceStr);
    fs.writeFileSync('backend/src/store.js', c);
    console.log("Patched publicUser privacy settings!");
} else {
    console.log("Regex not found for is_online!");
}
