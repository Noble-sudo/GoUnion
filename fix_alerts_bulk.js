const fs = require('fs');
const files = [
  'frontend/components/admin/ModerationQueue.jsx',
  'frontend/components/feed/CreatePost.jsx',
  'frontend/components/feed/StoryViewer.jsx',
  'frontend/pages/Groups.jsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('alert(')) {
    c = c.replace(/alert\(/g, `toast.error(`);
    // make sure useToast is imported and defined if it's not
    if (!c.includes('const { toast }')) {
      if (!c.includes('useToast')) {
        c = c.replace(/import React/, `import React from 'react';\nimport { useToast } from "../ui/Toast";\n//`);
        c = c.replace(/import \{ useToast \} from "\.\.\/ui\/Toast";\n\/\//, `import { useToast } from "../../components/ui/Toast";`);
      }
    }
    fs.writeFileSync(file, c);
    console.log('Fixed alert in ' + file);
  }
}
