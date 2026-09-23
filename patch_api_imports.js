import fs from 'fs';

// Fix ModerationQueue
let mq = fs.readFileSync('frontend/components/admin/ModerationQueue.jsx', 'utf8');
mq = mq.replace('import { api } from "../../lib/api";', 'import { api } from "../../services/api";');
fs.writeFileSync('frontend/components/admin/ModerationQueue.jsx', mq);

// Fix OverviewDashboard
let od = fs.readFileSync('frontend/components/admin/OverviewDashboard.jsx', 'utf8');
od = od.replace('import api from "../../api";', 'import { api } from "../../services/api";');
fs.writeFileSync('frontend/components/admin/OverviewDashboard.jsx', od);

// Fix UserDirectory just in case
let ud = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');
ud = ud.replace('import { api } from "../../api";', 'import { api } from "../../services/api";');
ud = ud.replace('import { api } from "../api";', 'import { api } from "../../services/api";');
ud = ud.replace('import { api } from "../../lib/api";', 'import { api } from "../../services/api";');
fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', ud);

console.log("Fixed API imports across all admin components!");
