const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Settings.jsx', 'utf8');

// Replace the Institution field block
content = content.replace(
  /<div className="space-y-1\.5">\s*<label className="text-\[10px\] font-black text-zinc-500 uppercase tracking-widest ml-1">Institution<\/label>\s*<input type="text" value=\{university\} onChange=\{\(e\) => setUniversity\(e\.target\.value\)\} className="w-full bg-white\/5 border border-white\/5 rounded-xl p-3\.5 text-sm text-white outline-none focus:border-primary\/30 transition-all font-medium" \/>\s*<\/div>/,
  `<div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Institution</label>
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5">
                    <div>
                      <p className="text-sm font-bold text-white">{user?.university || 'No campus selected'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user?.verification_status === 'VERIFIED' ? (
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1"><Shield size={12} /> Verified</span>
                        ) : user?.verification_status === 'LEGACY_UNVERIFIED' ? (
                          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">Legacy (Unverified)</span>
                        ) : (
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Unverified</span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => navigate('/onboarding')} className="text-[11px] font-bold text-black bg-white px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors">
                      Change Campus
                    </button>
                  </div>
                </div>`
);

fs.writeFileSync('frontend/pages/Settings.jsx', content);
console.log('Settings.jsx patched.');
