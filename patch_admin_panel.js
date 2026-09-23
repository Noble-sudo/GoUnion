const fs = require('fs');

let content = fs.readFileSync('frontend/pages/AdminPanel.jsx', 'utf8');

content = content.replace(
  /import \{ OverviewDashboard \} from '\.\.\/components\/admin\/OverviewDashboard';/,
  `import { OverviewDashboard } from '../components/admin/OverviewDashboard';\nimport { VerificationQueue } from '../components/admin/VerificationQueue';`
);

content = content.replace(
  /import \{ LayoutDashboard, Users, ShieldAlert, Building2, Radio, Scale, Shield \} from 'lucide-react';/,
  `import { LayoutDashboard, Users, ShieldAlert, Building2, Radio, Scale, Shield, ShieldCheck } from 'lucide-react';`
);

content = content.replace(
  /\{ id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert \},/,
  `{ id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },
        { id: 'verifications', label: 'Identity Verifications', icon: ShieldCheck },`
);

content = content.replace(
  /case 'moderation':\n\s*return <ModerationQueue \/>;/,
  `case 'moderation':\n                    return <ModerationQueue />;\n                case 'verifications':\n                    return <VerificationQueue />;`
);

fs.writeFileSync('frontend/pages/AdminPanel.jsx', content);
console.log('AdminPanel.jsx patched.');
