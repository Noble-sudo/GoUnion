const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

content = content.replace(
  /import \{ Building2, Search, Plus, MapPin, Loader2, X, Save \} from 'lucide-react';/,
  `import { Building2, Search, Plus, MapPin, Loader2, X, Save, Users } from 'lucide-react';`
);

fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Fixed Users import in CampusManager');
