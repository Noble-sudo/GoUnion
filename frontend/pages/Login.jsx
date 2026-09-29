import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, AtSign, Building2, Check, Eye, EyeOff, Lock, Mail, Search, User } from "lucide-react";
import { useAuthStore } from "../store";
import { api, keepAlive } from "../services/api";

const fallbackInstitutions = [
  { id: "", name: "Godfrey Okoye University", location: "Enugu, Nigeria", type: "University" },
  { id: "", name: "University of Nigeria", location: "Nsukka, Nigeria", type: "University" },
  { id: "", name: "University of Lagos", location: "Lagos, Nigeria", type: "University" },
  { id: "", name: "Covenant University", location: "Ota, Nigeria", type: "University" },
];

const steps = ["Identity", "Account", "Security"];

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isSignup, setIsSignup] = useState(searchParams.get("isSignup") !== "false");
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [suspendedState, setSuspendedState] = useState(null);
  const [appealText, setAppealText] = useState("");
  const [appealSubmitting, setAppealSubmitting] = useState(false);


  useEffect(() => {
    keepAlive();
    const handler = (e) => setIsWakingUp(e.detail.isWaking);
    window.addEventListener("gounion-server-waking", handler);
    api.institutions.getAll().then(setInstitutions).catch(() => setInstitutions([]));
    return () => window.removeEventListener("gounion-server-waking", handler);
  }, []);

  const institutionOptions = institutions.length ? institutions : fallbackInstitutions;
  const filteredInstitutions = useMemo(() => {
    const q = institutionQuery.trim().toLowerCase();
    if (!q) return institutionOptions.slice(0, 10);
    
    return institutionOptions
      .map((item) => {
        let score = 0;
        const nameMatch = item.name.toLowerCase();
        const aliasMatch = (item.aliases || []).map(a => a.toLowerCase());
        
        if (aliasMatch.includes(q)) score = 100;
        else if (aliasMatch.some(a => a.startsWith(q))) score = 80;
        else if (nameMatch.startsWith(q)) score = 60;
        else if (nameMatch.includes(` ${q}`)) score = 40;
        else if (nameMatch.includes(q) || (item.location && item.location.toLowerCase().includes(q))) score = 20;
        else if (aliasMatch.some(a => a.includes(q))) score = 10;
        
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
      .slice(0, 30)
      .map((x) => x.item);
  }, [institutionOptions, institutionQuery]);

  const canAdvance = () => {
    if (!isSignup) return true;
    if (step === 0) return fullName.trim().length >= 2 && username.trim().length >= 3;
    if (step === 1) return email.trim().includes("@");
    return password.length >= 8;
  };

  const signupPayload = () => {
    return {
      username: username.trim(),
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (isSignup && step < steps.length - 1) {
      if (canAdvance()) setStep((current) => current + 1);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const signupResult = await api.auth.signup(signupPayload());
        const devCode = signupResult?.dev_code ? `&dev_code=${encodeURIComponent(signupResult.dev_code)}` : "";
        navigate(`/confirm-email?email=${encodeURIComponent(email.trim())}${devCode}`);
        return;
      }
      const response = await api.auth.login({ email, password });
      login(response.user, response.access_token);
      navigate(response.user?.institutionId ? "/" : "/onboarding");
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.is_suspended) {
        setSuspendedState(error.response.data);
        return;
      }
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      setError(isTimeout ? "Server is still waking up. Please try again in a moment." : error.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((current) => !current);
    setError(null);
    setStep(0);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--rc-bg)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden min-h-[680px] flex-col justify-between border-r border-white/10 bg-white/[0.025] p-8 lg:flex">
            <Link to="/download" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-black">R</span>
              <span className="text-sm font-black uppercase tracking-[0.18em]">Reconnected</span>
            </Link>
            <div>
              <p className="rc-label mb-5">Join a verified campus</p>
              <h1 className="font-serif text-6xl leading-none">Your campus is waiting.</h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/52">Create one Reconnected identity, then step into GoUnion for community today and Teaky when the marketplace opens.</p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[rgba(199,249,79,0.2)] bg-[var(--rc-go-soft)] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--rc-go)]">GoUnion</p>
                <p className="mt-1 text-sm text-white/70">Campus community, Pulse, Circles, Messages.</p>
              </div>
              <div className="rounded-2xl border border-[rgba(104,212,255,0.2)] bg-[var(--rc-teaky-soft)] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--rc-teaky)]">Teaky</p>
                <p className="mt-1 text-sm text-white/70">Campus marketplace, coming soon.</p>
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/download" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black font-black">R</span>
                <span className="text-xs font-black uppercase tracking-[0.18em]">Reconnected</span>
              </Link>
            </div>

            <div className="mb-8">
              <p className="rc-label">{isSignup ? "Create Reconnected identity" : "Welcome to Reconnected"}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{isSignup ? steps[step] : "Sign in"}</h2>
              <p className="mt-3 text-sm leading-6 text-white/45">{isSignup ? "A short setup before email verification." : "Continue into your campus ecosystem."}</p>
            </div>

            {isSignup && (
              <div className="mb-8 grid grid-cols-4 gap-2">
                {steps.map((label, index) => (
                  <div key={label} className={`h-1.5 rounded-full ${index <= step ? "bg-[var(--rc-go)]" : "bg-white/10"}`} title={label} />
                ))}
              </div>
            )}

            {suspendedState ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                  <h3 className="text-xl font-black text-red-400 mb-2">Account Suspended</h3>
                  <p className="text-sm text-red-300/80 mb-4">{suspendedState.suspension_reason}</p>
                  
                  {suspendedState.appeal_status === 'none' && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!appealText.trim()) return;
                      setAppealSubmitting(true);
                      try {
                        await api.auth.submitAppeal(suspendedState.email || email, password, appealText);
                        setSuspendedState(prev => ({ ...prev, appeal_status: 'pending' }));
                      } catch(err) {
                        setError("Failed to submit appeal. Try again.");
                      } finally {
                        setAppealSubmitting(false);
                      }
                    }} className="space-y-3">
                      <textarea 
                        required 
                        value={appealText} 
                        onChange={(e) => setAppealText(e.target.value)} 
                        placeholder="State your case for appeal..." 
                        className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-red-500/50"
                      ></textarea>
                      <button type="submit" disabled={appealSubmitting} className="w-full rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 py-3 text-sm font-bold transition disabled:opacity-50">
                        {appealSubmitting ? "Submitting..." : "Submit Appeal"}
                      </button>
                    </form>
                  )}
                  {suspendedState.appeal_status === 'pending' && (
                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-200 text-sm font-bold">
                      Your appeal is under review.
                    </div>
                  )}
                  {suspendedState.appeal_status === 'rejected' && (
                    <div className="rounded-xl bg-black/20 border border-white/5 p-4 text-white/50 text-sm font-bold">
                      Your appeal was rejected.
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => { setSuspendedState(null); setError(null); }} className="w-full text-center text-sm text-white/45 hover:text-white transition">
                  Back to Login
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {(!isSignup || step === 1) && (
                <div className="space-y-2">
                  <label className="rc-label ml-1">{isSignup ? "Email address" : "Email or username"}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                    <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@university.edu" className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition focus:border-[var(--rc-go)]" />
                  </div>
                </div>
              )}

              {isSignup && step === 0 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="grid gap-5">
                  <div className="space-y-2">
                    <label className="rc-label ml-1">Full name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                      <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition focus:border-[var(--rc-go)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="rc-label ml-1">Username</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                      <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="arivera" className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition focus:border-[var(--rc-go)]" />
                    </div>
                  </div>
                </motion.div>
              )}

              {(!isSignup || step === 2) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="rc-label ml-1">Password</label>
                    {!isSignup && <Link to="/forgot-password" className="text-xs font-bold text-white/35 transition hover:text-white">Forgot?</Link>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-12 pr-12 text-sm text-white outline-none transition focus:border-[var(--rc-go)]" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
              )}

              {isWakingUp && <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs font-bold text-amber-200">Server is waking up. This can take a moment.</div>}

              <div className="flex gap-3 pt-2">
                {isSignup && step > 0 && (
                  <button type="button" onClick={() => setStep((current) => current - 1)} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-white/65 transition hover:bg-white/5 hover:text-white">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <button type="submit" disabled={loading || !canAdvance()} className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-black text-black transition hover:bg-white/90 disabled:opacity-45">
                  {loading ? "Working..." : isSignup && step < steps.length - 1 ? "Continue" : isSignup ? "Create account" : "Continue with email"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
            )}

            <button type="button" onClick={switchMode} className="mt-8 w-full text-center text-sm text-white/45 transition hover:text-white">
              {isSignup ? "Already have a Reconnected account? Sign in" : "New to Reconnected? Create your campus identity"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
