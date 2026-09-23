const fs = require('fs');

let c = fs.readFileSync('frontend/pages/SoundFeed.jsx', 'utf8');

if (c.includes('window.alert(')) {
  c = c.replace(/window\.alert\(/g, `toast.error(`);
  c = c.replace(/alert\(/g, `toast.error(`);
  fs.writeFileSync('frontend/pages/SoundFeed.jsx', c);
  console.log('Fixed SoundFeed alert');
}
