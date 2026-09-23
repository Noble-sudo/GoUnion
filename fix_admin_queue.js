const fs = require('fs');

// 1. Fix admin.js query
let adminContent = fs.readFileSync('backend/src/routes/admin.js', 'utf8');
adminContent = adminContent.replace(
  /const identities = await StudentIdentity\.find\(\{ status: 'PENDING' \}\)\.sort\(\{ created_at: -1 \}\)\.lean\(\);/,
  `const identities = await StudentIdentity.find({ $or: [{ status: 'PENDING' }, { status: 'VERIFIED', needs_audit: true }] }).sort({ created_at: -1 }).lean();`
);
fs.writeFileSync('backend/src/routes/admin.js', adminContent);

// 2. Add toast and error handling to VerificationQueue
let queueContent = fs.readFileSync('frontend/components/admin/VerificationQueue.jsx', 'utf8');

// Ensure toast is imported
if (!queueContent.includes('import toast')) {
  queueContent = queueContent.replace(
    /import \{ useQuery, useMutation, useQueryClient \} from '@tanstack\/react-query';/,
    `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport toast from 'react-hot-toast';`
  );
}

// Add error and success handlers to mutation
const oldMutation = `const resolveMutation = useMutation({
    mutationFn: ({ id, action, reason }) => api.admin.resolveIdentity(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-identities']);
      setSelectedIdentity(null);
    }
  });`;

const newMutation = `const resolveMutation = useMutation({
    mutationFn: ({ id, action, reason }) => api.admin.resolveIdentity(id, action, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-identities'] });
      toast.success(\`Identity \${variables.action}d successfully!\`);
      setSelectedIdentity(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to resolve identity. Check console.');
    }
  });`;

queueContent = queueContent.replace(oldMutation, newMutation);

fs.writeFileSync('frontend/components/admin/VerificationQueue.jsx', queueContent);
console.log('Fixed admin query and added toasts');
