const fs = require('fs');

let content = fs.readFileSync('frontend/components/admin/VerificationQueue.jsx', 'utf8');

// 1. Replace the import
content = content.replace(
  /import toast from 'react-hot-toast';/,
  `import { useToast } from '../ui/Toast';`
);

// 2. Inject useToast inside the component
content = content.replace(
  /const queryClient = useQueryClient\(\);/,
  `const queryClient = useQueryClient();
  const { toast } = useToast();`
);

// 3. Fix the toast calls
content = content.replace(
  /toast\.success\(\`Identity \$\{variables\.action\}d successfully!\`\);/,
  `toast(\`Identity \${variables.action}d successfully!\`, 'success');`
);
content = content.replace(
  /toast\.error\(error\.response\?\.data\?\.message \|\| 'Failed to resolve identity\. Check console\.'\);/,
  `toast(error.response?.data?.message || 'Failed to resolve identity.', 'error');`
);

fs.writeFileSync('frontend/components/admin/VerificationQueue.jsx', content);
console.log('Fixed custom toast integration');
