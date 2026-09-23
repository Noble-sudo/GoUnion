const fs = require('fs');

let queueContent = fs.readFileSync('frontend/components/admin/VerificationQueue.jsx', 'utf8');

const oldDetails = `<div className="mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-white/60">
                  <GraduationCap size={14} /> {identity.identifier}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/60">
                  <Clock size={14} /> {new Date(identity.created_at).toLocaleDateString()}
                </span>
              </div>`;

const newDetails = `<div className="mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-white/60">
                  <GraduationCap size={14} /> {identity.identifier}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/60">
                  <Clock size={14} /> {new Date(identity.created_at).toLocaleDateString()}
                </span>
                {identity.verification_data?.fileUrl && (
                  <a href={identity.verification_data.fileUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-bold ml-2">
                    <FileText size={14} /> View ID Document
                  </a>
                )}
              </div>`;

queueContent = queueContent.replace(oldDetails, newDetails);

fs.writeFileSync('frontend/components/admin/VerificationQueue.jsx', queueContent);
console.log('Added view document link to Admin Queue');
