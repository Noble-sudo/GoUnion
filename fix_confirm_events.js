const fs = require('fs');

function replaceConfirm(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('useConfirm')) return; // already done

  // If it's a component file, we need to inject the import and the hook.
  // This is tricky because it's compiled or raw JSX.
  // I will just use standard regex for the known files.
  
  if (file.includes('EventsTab.jsx')) {
    c = c.replace(/import \{ api \} from '\.\.\/\.\.\/services\/api';/, `import { api } from '../../services/api';\nimport { useConfirm } from '../ui/ConfirmProvider';`);
    c = c.replace(/const queryClient = useQueryClient\(\);/, `const queryClient = useQueryClient();\n  const confirm = useConfirm();`);
    c = c.replace(/if \(window\.confirm\("Are you sure you want to delete this event\?"\)\) \{\s*deleteMutation\.mutate\(ev\.id\);\s*\}/, `confirm({ title: 'Delete Event', message: 'Are you sure you want to delete this event?', isDanger: true }).then(yes => { if (yes) deleteMutation.mutate(ev.id); })`);
    fs.writeFileSync(file, c);
  }
}

replaceConfirm('frontend/components/groups/EventsTab.jsx');
console.log('Fixed EventsTab');
