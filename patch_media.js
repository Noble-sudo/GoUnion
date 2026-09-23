import fs from 'fs';

let code = fs.readFileSync('frontend/components/ui/MediaPlayer.jsx', 'utf8');

// Start muted so autoplay works
code = code.replace(
  'const [muted, setMuted] = useState(false); // start unmuted for UX',
  'const [muted, setMuted] = useState(true); // start muted so browser autoplay works'
);

// Update watermark
code = code.replace(
  'watermark = "GoUnion"',
  'watermark = "Reconnected"'
);
code = code.replace(
  'children: "GoUnion" })',
  'children: "RECONNECTED" })'
);

fs.writeFileSync('frontend/components/ui/MediaPlayer.jsx', code);
console.log('Patched MediaPlayer.jsx');
