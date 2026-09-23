import fs from 'fs';

let content = fs.readFileSync('frontend/services/api.js', 'utf8');
content = content.replace(
  "case 'follow':\n            return 'started following you.';",
  "case 'follow':\n            return 'started following you.';\n        case 'profile_view':\n            return 'viewed your profile.';"
);
content = content.replace(
  "case 'follow':\r\n            return 'started following you.';",
  "case 'follow':\r\n            return 'started following you.';\r\n        case 'profile_view':\r\n            return 'viewed your profile.';"
);

fs.writeFileSync('frontend/services/api.js', content);
console.log('Fixed notificationMessage in api.js');
