import fs from 'fs';

let landingCode = fs.readFileSync('frontend/pages/Landing.jsx', 'utf8');

landingCode = landingCode.replace(
  'title: "Discover",\n    description: "Explore trending topics, people, events, and opportunities on your campus.",',
  'title: "Konnect Network",\n    description: "Step beyond your campus. Discover students, communities, and trends across the entire Reconnected ecosystem.",'
);

landingCode = landingCode.replace(
  'title: "Circles",\n    description: "Join communities for your department, clubs, interests, and campus projects.",',
  'title: "Cross-Campus Circles",\n    description: "Create or join communities (Academic, Sports, Gaming) spanning multiple universities or exclusive to yours.",'
);

landingCode = landingCode.replace(
  'title: "Events",\n    description: "Never miss a campus event. Competitions, meetups, workshops, and parties.",',
  'title: "Rich Media & Voice",\n    description: "Share your moments through 24h stories, video drops, and real-time voice notes in messages.",'
);

// Update header subtitle if needed
landingCode = landingCode.replace(
  'Reconnected brings your campus community, conversations, events and future marketplace into one place.',
  'Reconnected is the ultimate student network. Your campus is your home, but the entire student world is now at your fingertips.'
);

fs.writeFileSync('frontend/pages/Landing.jsx', landingCode);
console.log('Patched Landing.jsx');
