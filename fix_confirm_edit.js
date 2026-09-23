const fs = require('fs');

let c = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');

if (!c.includes('useConfirm')) {
  c = c.replace(/import \{ X, Upload, Shield, Users, Globe \} from "lucide-react";/, `import { X, Upload, Shield, Users, Globe } from "lucide-react";\nimport { useConfirm } from "../ui/ConfirmProvider";`);
  c = c.replace(/const queryClient = useQueryClient\(\);/, `const queryClient = useQueryClient();\n  const confirm = useConfirm();`);
  
  c = c.replace(/if \(window\.confirm\("Are you sure you want to delete this circle\? This action cannot be undone\."\)\) \{\s*deleteMutation\.mutate\(\);\s*\}/g, `confirm({ title: 'Delete Circle', message: 'Are you sure you want to delete this circle? This action cannot be undone.', isDanger: true, confirmText: 'Delete Circle' }).then(yes => { if (yes) deleteMutation.mutate(); })`);

  fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', c);
  console.log('Fixed EditGroupModal');
}
