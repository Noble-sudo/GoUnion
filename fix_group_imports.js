import fs from 'fs';

let content = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

content = content.replace(
  'import { ArrowLeft, Users, Shield, Globe, Lock, Share2, Calendar, Edit } from "lucide-react";',
  'import { ArrowLeft, Users, Shield, Globe, Lock, Share2, Calendar, Edit, X, Check } from "lucide-react";'
);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', content);
console.log('Fixed imports in GroupDetails.jsx');
