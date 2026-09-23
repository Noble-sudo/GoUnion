import fs from 'fs';

let content = fs.readFileSync('frontend/pages/Notifications.jsx', 'utf8');

if (!content.includes(' Eye }')) {
  content = content.replace(
    "import { Bell, Heart, MessageSquare, UserPlus, Users, AtSign } from 'lucide-react';",
    "import { Bell, Heart, MessageSquare, UserPlus, Users, AtSign, Eye } from 'lucide-react';"
  );
}

fs.writeFileSync('frontend/pages/Notifications.jsx', content);
console.log('Fixed Eye import in Notifications.jsx');
