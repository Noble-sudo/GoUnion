import fs from 'fs';

let gdCode = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// 1. Add EditGroupModal import
gdCode = gdCode.replace(
  'import { ArrowLeft, Share2, Users, Calendar, Shield, MapPin, Globe, Lock, MessageSquare } from "lucide-react";',
  'import { ArrowLeft, Share2, Users, Calendar, Shield, MapPin, Globe, Lock, MessageSquare, Edit } from "lucide-react";\nimport { EditGroupModal } from "../components/groups/EditGroupModal";'
);

// 2. Add isEditModalOpen state
gdCode = gdCode.replace(
  'const [activeTab, setActiveTab] = useState("feed");',
  'const [activeTab, setActiveTab] = useState("feed");\n  const [isEditModalOpen, setIsEditModalOpen] = useState(false);'
);

// 3. Add Edit Button
gdCode = gdCode.replace(
  '<button onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10">\n              <Share2 size={20} />\n            </button>',
  `{isAdmin && (
              <button onClick={() => setIsEditModalOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10" title="Edit Circle">
                <Edit size={20} />
              </button>
            )}
            <button onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10">
              <Share2 size={20} />
            </button>`
);

// 4. Add Modal at the end
gdCode = gdCode.replace(
  '</Layout>\n    );',
  '</Layout>\n\n    {isEditModalOpen && <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} group={group} />}\n    </>'
);
gdCode = gdCode.replace(
  'return (\n      <Layout>',
  'return (\n      <>\n      <Layout>'
);

fs.writeFileSync('frontend/pages/GroupDetails.jsx', gdCode);
console.log('Patched GroupDetails.jsx');
