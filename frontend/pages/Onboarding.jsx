import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Building2, Check, Shield, Mail, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuthStore } from "../store";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(0);
  const [institutions, setInstitutions] = useState([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [identifier, setIdentifier] = useState("");
  const [idFile, setIdFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.institutions.getAll().then(setInstitutions).catch(() => setInstitutions([]));
    if (user?.active_identity_id || user?.institution_id) {
      navigate("/");
    }
  }, [user, navigate]);

  const requestIdentityMutation = useMutation({
    mutationFn: (data) => api.identities.request(data),
    onSuccess: async () => {
      setStep(3);
      // Wait a moment then refresh user data
      setTimeout(async () => {
        const updatedUser = await api.auth.me();
        updateUser(updatedUser);
        navigate("/");
      }, 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to submit verification.");
    }
  });

  const filteredInstitutions = useMemo(() => {
    const q = institutionQuery.trim().toLowerCase();
    if (!q) return institutions.slice(0, 30); // show top 30 initially
    return institutions.filter(i => 
      i.name.toLowerCase().includes(q) || 
      (i.aliases && i.aliases.some(a => a.toLowerCase().includes(q)))
    ).slice(0, 50); // allow up to 50 results when searching
  }, [institutions, institutionQuery]);

  const submitVerification = async () => {
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
  };

  const getMethods = () => selectedInstitution?.verification_methods || ['institutional_email', 'manual'];

  return (
    <div className="min-h-screen bg-[var(--rc-bg)] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl sm:p-8">
          <div className="mb-8">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reconnected Identity</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {step === 0 ? "Select your campus" : step === 1 ? "Verification Method" : step === 2 ? "Verify Identity" : "Request Submitted"}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="campus" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <input 
                  value={institutionQuery} 
                  onChange={(e) => { setInstitutionQuery(e.target.value); setSelectedInstitution(null); }} 
                  placeholder="Search universities and polytechnics..." 
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition focus:border-primary/30" 
                />
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                  {filteredInstitutions.map((institution) => (
                    <button key={institution.id} onClick={() => { setSelectedInstitution(institution); setInstitutionQuery(institution.name); }} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${selectedInstitution?.id === institution.id ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Building2 size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{institution.name}</span>
                        <span className="mt-1 block truncate text-xs text-white/42">{institution.location}</span>
                      </span>
                      {selectedInstitution?.id === institution.id && <Check size={18} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
                <button disabled={!selectedInstitution} onClick={() => setStep(1)} className="mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white font-black text-black disabled:opacity-40">Continue <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="method" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-sm text-white/60 mb-2">How would you like to verify your student status at {selectedInstitution?.name}?</p>
                <div className="grid gap-3">
                  {getMethods().includes('institutional_email') && (
                    <button onClick={() => setVerificationMethod('institutional_email')} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${verificationMethod === 'institutional_email' ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                      <Mail size={24} className="text-blue-400" />
                      <div>
                        <span className="block font-bold text-white">Student Email</span>
                        <span className="block text-xs text-white/50 mt-1">Instant verification using your @university.edu.ng email.</span>
                      </div>
                    </button>
                  )}
                  {getMethods().includes('manual') && (
                    <button onClick={() => setVerificationMethod('manual')} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${verificationMethod === 'manual' ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                      <FileText size={24} className="text-blue-400" />
                      <div>
                        <span className="block font-bold text-white">Upload ID Document</span>
                        <span className="block text-xs text-white/50 mt-1">Upload a photo of your Student ID or Admission Letter for instant access.</span>
                      </div>
                    </button>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(0)} className="h-14 px-6 rounded-2xl border border-white/10 font-bold text-white/60 hover:text-white">Back</button>
                  <button disabled={!verificationMethod} onClick={() => setStep(2)} className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-white font-black text-black disabled:opacity-40">Continue <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
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
                  <button disabled={!identifier.trim() || requestIdentityMutation.isPending || isUploading || (verificationMethod === 'manual' && !idFile)} onClick={submitVerification} className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-white font-black text-black disabled:opacity-40">
                    {requestIdentityMutation.isPending || isUploading ? "Submitting..." : "Submit Verification"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
                  <Shield size={36} className="text-blue-400" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">Identity Requested</h3>
                <p className="text-sm text-white/60 max-w-sm">
                  {verificationMethod === 'institutional_email' 
                    ? "Check your student email inbox for a verification link." 
                    : "Your student identity is under review by our administrators. This usually takes up to 24 hours."}
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Entering Reconnected...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
