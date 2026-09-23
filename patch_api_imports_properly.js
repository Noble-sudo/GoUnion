import fs from 'fs';

// Fix ModerationQueue
let mq = fs.readFileSync('frontend/components/admin/ModerationQueue.jsx', 'utf8');
mq = mq.replace(/import\s+\{\s*api\s*\}\s+from\s+['"]\.\.\/\.\.\/lib\/api['"];/, "import { api } from '../../services/api';");
fs.writeFileSync('frontend/components/admin/ModerationQueue.jsx', mq);

// Fix OverviewDashboard
let od = fs.readFileSync('frontend/components/admin/OverviewDashboard.jsx', 'utf8');
od = od.replace(/import\s+api\s+from\s+['"]\.\.\/\.\.\/api['"];/, "import { api } from '../../services/api';");
fs.writeFileSync('frontend/components/admin/OverviewDashboard.jsx', od);

console.log("Fixed API imports with regex!");
