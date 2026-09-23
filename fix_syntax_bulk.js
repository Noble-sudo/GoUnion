const fs = require('fs');

let groups = fs.readFileSync('frontend/pages/Groups.jsx', 'utf8');
groups = groups.replace(/import React from 'react';\nimport \{ useToast \} from "\.\.\/\.\.\/components\/ui\/Toast";, \{ useRef, useState \} from "react";/, `import React, { useRef, useState } from "react";\nimport { useToast } from "../components/ui/Toast";`);
fs.writeFileSync('frontend/pages/Groups.jsx', groups);

let story = fs.readFileSync('frontend/components/feed/StoryViewer.jsx', 'utf8');
story = story.replace(/import React from 'react';\nimport \{ useToast \} from "\.\.\/\.\.\/components\/ui\/Toast";, \{ useEffect, useState \} from "react";/, `import React, { useEffect, useState } from "react";\nimport { useToast } from "../ui/Toast";`);
fs.writeFileSync('frontend/components/feed/StoryViewer.jsx', story);

console.log('Fixed syntax errors in Groups.jsx and StoryViewer.jsx');
