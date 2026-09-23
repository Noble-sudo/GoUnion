const fs = require('fs');

let c = fs.readFileSync('frontend/pages/GroupDetails.jsx', 'utf8');

if (!c.includes('useConfirm')) {
  c = c.replace(/import \{ useToast \} from "\.\.\/components\/ui\/Toast";/, `import { useToast } from "../components/ui/Toast";\nimport { useConfirm } from "../components/ui/ConfirmProvider";`);
  c = c.replace(/const \{ toast \} = useToast\(\);/, `const { toast } = useToast();\n    const confirm = useConfirm();`);
  
  // There are two confirms in GroupDetails maybe?
  c = c.replace(/if \(window\.confirm\("Are you sure you want to remove this member\?"\)\) \{\s*removeMemberMutation\.mutate\(member\.user_id\);\s*\}/g, `confirm({ title: 'Remove Member', message: 'Are you sure you want to remove this member from the circle?', isDanger: true, confirmText: 'Remove' }).then(yes => { if (yes) removeMemberMutation.mutate(member.user_id); })`);

  c = c.replace(/if \(window\.confirm\("Are you sure you want to leave this circle\?"\)\) \{\s*leaveMutation\.mutate\(\);\s*\}/g, `confirm({ title: 'Leave Circle', message: 'Are you sure you want to leave this circle?', isDanger: true, confirmText: 'Leave' }).then(yes => { if (yes) leaveMutation.mutate(); })`);

  fs.writeFileSync('frontend/pages/GroupDetails.jsx', c);
  console.log('Fixed GroupDetails');
}
