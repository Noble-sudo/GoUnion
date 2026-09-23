const fs = require('fs');

// 1. Patch api.js
let apiContent = fs.readFileSync('frontend/services/api.js', 'utf8');
apiContent = apiContent.replace(
  /resolveIdentity: async \(id, action\) => \{\n\s*const res = await apiClient\.post\(\`\/admin\/identities\/\$\{id\}\/\$\{action\}\`\);/,
  `resolveIdentity: async (id, action, reason) => {
            const res = await apiClient.post(\`/admin/identities/\${id}/\${action}\`, { reason });`
);
fs.writeFileSync('frontend/services/api.js', apiContent);

// 2. Patch VerificationQueue.jsx
let queueContent = fs.readFileSync('frontend/components/admin/VerificationQueue.jsx', 'utf8');
queueContent = queueContent.replace(
  /resolveMutation\.mutate\(\{ id: identity\.id, action: 'reject' \}\);/,
  `const reason = window.prompt("Provide a reason for rejection (e.g., 'ID is blurry' or 'Name mismatch'):");
                  if (reason === null) return;
                  resolveMutation.mutate({ id: identity.id, action: 'reject', reason });`
);
// Also update the mutation signature
queueContent = queueContent.replace(
  /mutationFn: \(\{ id, action \}\) => api\.admin\.resolveIdentity\(id, action\),/,
  `mutationFn: ({ id, action, reason }) => api.admin.resolveIdentity(id, action, reason),`
);
fs.writeFileSync('frontend/components/admin/VerificationQueue.jsx', queueContent);

// 3. Patch Onboarding.jsx
let onbContent = fs.readFileSync('frontend/pages/Onboarding.jsx', 'utf8');
// Add a red alert box above the steps if the user has a rejection reason
const alertBox = `
        {user?.verification_status === 'REJECTED' && user?.rejection_reason && (
          <div className="w-full max-w-lg mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
            <Shield className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-red-400 mb-1">Verification Rejected</h4>
              <p className="text-xs text-red-300/80">{user.rejection_reason}</p>
              <p className="text-xs text-red-300/60 mt-2">Please submit a new verification request below.</p>
            </div>
          </div>
        )}
        
        {/* Step Indicators */}`;

onbContent = onbContent.replace(
  /\{\/\* Step Indicators \*\/\}/,
  alertBox
);
fs.writeFileSync('frontend/pages/Onboarding.jsx', onbContent);

console.log('Frontend rejection reason added');
