import fs from 'fs';

let gdCode = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

// 1. Import CreatePost
if (!gdCode.includes('import { CreatePost }')) {
  gdCode = gdCode.replace(
    'import { EditGroupModal } from "../components/groups/EditGroupModal";',
    'import { EditGroupModal } from "../components/groups/EditGroupModal";\nimport { CreatePost } from "../components/feed/CreatePost";'
  );
}

// 2. Replace dummy div with CreatePost
const dummyDivStart = '<div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.02]">';
const dummyDivEnd = '</div>\n                     </div>';

const startIndex = gdCode.indexOf(dummyDivStart);
if (startIndex !== -1) {
  // We need to replace the entire chunk
  // Let's just use string replace for the whole block
  const block = `                     <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                       <div className="flex gap-4 items-center">
                         <img src={user?.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" />
                         <div className="flex-1 bg-white/5 rounded-full py-3 px-5 text-white/40 text-sm cursor-text border border-white/5 transition-colors hover:bg-white/10">
                           Share something with the community...
                         </div>
                       </div>
                     </div>`;
                     
  gdCode = gdCode.replace(block, '<CreatePost groupId={id} />');
}

fs.writeFileSync('frontend/pages/GroupDetails.jsx', gdCode);
console.log('Patched GroupDetails.jsx to use CreatePost');
