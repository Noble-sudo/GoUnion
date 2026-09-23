import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');

// 1. Add import at the top
content = content.replace(
  "import { useAuthStore } from '../store';",
  "import { useAuthStore } from '../store';\nimport { formatTimeAgo } from '../utils/format';"
);

// 2. Change notification timestamp
content = content.replace(
  "timestamp: createdAt\n            ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })\n            : notification.timestamp || 'Now',",
  "timestamp: createdAt ? formatTimeAgo(createdAt) : notification.timestamp || 'Now',"
);

// also catch carriage return just in case
content = content.replace(
  "timestamp: createdAt\r\n            ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })\r\n            : notification.timestamp || 'Now',",
  "timestamp: createdAt ? formatTimeAgo(createdAt) : notification.timestamp || 'Now',"
);


fs.writeFileSync('frontend/services/api.js', content);
console.log('Fixed time formatting in api.js notifications');
