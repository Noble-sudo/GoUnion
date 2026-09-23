const fs = require('fs');

let content = fs.readFileSync('frontend/pages/Onboarding.jsx', 'utf8');

// Add file state
if (!content.includes('const [idFile, setIdFile] = useState(null)')) {
  content = content.replace(
    /const \[identifier, setIdentifier\] = useState\(""\);/,
    `const [identifier, setIdentifier] = useState("");
  const [idFile, setIdFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);`
  );
}

// Update submitVerification logic
const oldSubmit = `const submitVerification = () => {
    setError(null);
    if (!selectedInstitution || !verificationMethod || !identifier.trim()) return;
    requestIdentityMutation.mutate({
      institution_id: selectedInstitution.id,
      method: verificationMethod,
      identifier: identifier.trim()
    });
  };`;

const newSubmit = `const submitVerification = async () => {
    setError(null);
    if (!selectedInstitution || !verificationMethod || !identifier.trim()) return;
    if (verificationMethod === 'manual' && !idFile) {
      setError('Please attach a photo of your Student ID or Admission Letter.');
      return;
    }

    setIsUploading(true);
    let fileUrl = null;
    try {
      if (idFile) {
        fileUrl = await api.media.upload(idFile);
      }
      
      requestIdentityMutation.mutate({
        institution_id: selectedInstitution.id,
        method: verificationMethod,
        identifier: identifier.trim(),
        verification_data: fileUrl ? { fileUrl } : {}
      });
    } catch (err) {
      setError('Failed to upload ID photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };`;

content = content.replace(oldSubmit, newSubmit);

// Update step 2 UI
const oldStep2 = `{step === 2 && (
              <motion.div key="submit" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    {verificationMethod === 'institutional_email' ? 'Student Email Address' : 'Student ID / Matric Number'}
                  </label>
                  <input 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    placeholder={verificationMethod === 'institutional_email' ? 'student@university.edu.ng' : 'e.g. 2021/123456'} 
                    className="mt-1 h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition focus:border-primary/30" 
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="h-14 px-6 rounded-2xl border border-white/10 font-bold text-white/60 hover:text-white">Back</button>
                  <button disabled={requestIdentityMutation.isPending || !identifier.trim()} onClick={submitVerification} className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-primary font-black text-black disabled:opacity-40">
                    {requestIdentityMutation.isPending ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            )}`;

const newStep2 = `{step === 2 && (
              <motion.div key="submit" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    {verificationMethod === 'institutional_email' ? 'Student Email Address' : 'Student ID / Matric Number'}
                  </label>
                  <input 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    placeholder={verificationMethod === 'institutional_email' ? 'student@university.edu.ng' : 'e.g. 2021/123456'} 
                    className="mt-1 h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition focus:border-primary/30" 
                  />
                </div>

                {verificationMethod === 'manual' && (
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">
                      Upload Proof (Student ID or Admission Letter)
                    </label>
                    <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center hover:bg-white/[0.02] transition-colors cursor-pointer relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setIdFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {idFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <Check size={24} className="text-emerald-400" />
                          <span className="text-sm font-bold text-white truncate max-w-full px-4">{idFile.name}</span>
                          <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Attached successfully</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={24} className="text-white/40" />
                          <span className="text-sm font-bold text-white">Tap to upload or snap a photo</span>
                          <span className="text-xs text-white/40 max-w-[200px] leading-relaxed">Accepted documents: Valid Student ID Card, Admission Letter, or Signed Course Registration form.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="h-14 px-6 rounded-2xl border border-white/10 font-bold text-white/60 hover:text-white">Back</button>
                  <button disabled={requestIdentityMutation.isPending || isUploading || !identifier.trim() || (verificationMethod === 'manual' && !idFile)} onClick={submitVerification} className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-primary font-black text-black disabled:opacity-40">
                    {requestIdentityMutation.isPending || isUploading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            )}`;

content = content.replace(oldStep2, newStep2);

fs.writeFileSync('frontend/pages/Onboarding.jsx', content);
console.log('Added file upload to Onboarding');
