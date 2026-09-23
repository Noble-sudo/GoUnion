import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/BroadcastCenter.jsx', 'utf8');

c = c.replace(
    "import { toast } from 'react-hot-toast';",
    "import { useToast } from '../../components/ui/Toast';"
);

c = c.replace(
    'export default function BroadcastCenter() {',
    'export default function BroadcastCenter() {\n    const { toast } = useToast();'
);

fs.writeFileSync('frontend/components/admin/BroadcastCenter.jsx', c);
console.log("Fixed Toast import in BroadcastCenter.jsx!");
