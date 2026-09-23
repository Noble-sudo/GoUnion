import fs from 'fs';

let content = fs.readFileSync('frontend/components/layout/NotificationDropdown.jsx', 'utf8');

if (!content.includes(' Eye }')) {
  content = content.replace(
    'import { Bell, Heart, MessageCircle, UserPlus, X } from "lucide-react";',
    'import { Bell, Heart, MessageCircle, UserPlus, X, Eye } from "lucide-react";'
  );
}

fs.writeFileSync('frontend/components/layout/NotificationDropdown.jsx', content);
console.log('Fixed Eye import in NotificationDropdown.jsx');
