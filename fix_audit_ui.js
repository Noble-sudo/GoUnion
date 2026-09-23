const fs = require('fs');

let queueContent = fs.readFileSync('frontend/components/admin/VerificationQueue.jsx', 'utf8');

const oldHeader = `<div className="flex items-center gap-3">
                <h3 className="font-bold text-white">{identity.user?.full_name || identity.user?.username}</h3>
                <span className="text-xs text-white/40">@{identity.user?.username}</span>
              </div>`;

const newHeader = `<div className="flex items-center gap-3">
                <h3 className="font-bold text-white">{identity.user?.full_name || identity.user?.username}</h3>
                <span className="text-xs text-white/40">@{identity.user?.username}</span>
                {identity.status === 'VERIFIED' && identity.needs_audit ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                    Auto-Approved (Needs Audit)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                    Pending Review
                  </span>
                )}
              </div>`;

queueContent = queueContent.replace(oldHeader, newHeader);

// Let's also update the "Approve" button text for audit items
queueContent = queueContent.replace(
  /<CheckCircle2 size=\{16\} \/> Approve/,
  `{identity.needs_audit ? <><CheckCircle2 size={16} /> Confirm Audit</> : <><CheckCircle2 size={16} /> Approve</>}`
);

fs.writeFileSync('frontend/components/admin/VerificationQueue.jsx', queueContent);
console.log('Frontend Verification Queue updated for Audits');
