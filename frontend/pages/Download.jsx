import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Apple, Building2, CheckCircle2, Download, MessageCircle, Search, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Users } from 'lucide-react';
import { usePwaStore } from '../store/pwaStore';

export const DownloadPage = () => {
  const { installPrompt, isInstalled } = usePwaStore();
  const navigate = useNavigate();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    if (window.deferredPWAInstallPrompt && !usePwaStore.getState().installPrompt) {
      usePwaStore.getState().setInstallPrompt(window.deferredPWAInstallPrompt);
    }
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstallHelp(true);
      return;
    }

    try {
      installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      usePwaStore.getState().clearInstallPrompt();
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--rc-bg)] text-[var(--rc-text)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white text-base font-black text-black">R</span>
          <span className="text-sm font-black uppercase tracking-[0.18em] text-white">Reconnected</span>
        </button>
        <button onClick={() => navigate('/login')} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/70 transition hover:border-white/25 hover:text-white">
          Sign in
        </button>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rc-label mb-5">
            Reconnected for Nigerian campuses
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="max-w-4xl font-serif text-5xl leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            Your campus. Your people. Your connection.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
            Reconnected brings your campus community, conversations, events and future marketplace into one serious platform built around verified student life.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            {isInstalled ? (
              <button onClick={() => navigate('/login')} className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 text-sm font-black text-black transition hover:bg-white/90">
                Open Reconnected <Smartphone size={18} />
              </button>
            ) : installPrompt ? (
              <button onClick={handleInstall} className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 text-sm font-black text-black transition hover:bg-white/90">
                Install GoUnion <Download size={18} />
              </button>
            ) : (
              <button onClick={() => setShowInstallHelp(true)} className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 text-sm font-black text-black transition hover:bg-white/90">
                {isIOS ? 'Add to iPhone' : 'Install on Android'} {isIOS ? <Apple size={18} /> : <Download size={18} />}
              </button>
            )}
            <button onClick={() => navigate('/login')} className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/5">
              Sign in after install
            </button>
          </motion.div>

          {(!installPrompt || showInstallHelp) && !isInstalled && (
            <div className="mt-4 grid max-w-xl gap-2 text-xs leading-5 text-white/45 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-1 font-black text-white">iPhone</p>
                <p>Tap Share, choose Add to Home Screen, then open GoUnion from your home screen.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-1 font-black text-white">Android</p>
                <p>Tap your browser menu and choose Install app or Add to Home screen.</p>
              </div>
            </div>
          )}

          <div className="mt-10 max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white/42">
              <Search size={18} />
              <span className="text-sm">Search universities, polytechnics and colleges...</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {['Godfrey Okoye University', 'University of Lagos', 'Yaba College of Technology', 'Ahmadu Bello University'].map((school) => (
                <div key={school} className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                  <p className="truncate text-sm font-bold text-white">{school}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">Campus available</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="grid gap-4">
          <div className="rc-surface-strong rounded-[2rem] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rc-label">Current product</p>
                <h2 className="mt-2 text-2xl font-black text-white">GoUnion</h2>
              </div>
              <span className="rc-product-go rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                [MessageCircle, 'Campus Pulse', 'Drops and conversations'],
                [Users, 'Circles', 'Communities that move'],
                [Sparkles, 'Signals', 'Activity that matters'],
                [Building2, 'Campus identity', 'Belong before you post'],
              ].map(([Icon, title, body]) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <Icon className="mb-4 text-[var(--rc-go)]" size={21} />
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/42">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <img src="/screenshot-main.png" alt="GoUnion Campus Pulse preview" className="h-72 w-full object-cover object-top opacity-90" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rc-surface rounded-[2rem] p-5">
              <ShoppingBag className="text-[var(--rc-teaky)]" size={24} />
              <h3 className="mt-5 text-xl font-black text-white">Teaky</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">A campus marketplace scoped to your institution.</p>
              <span className="mt-5 inline-flex rounded-full border border-[rgba(104,212,255,0.24)] bg-[var(--rc-teaky-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--rc-teaky)]">Coming soon</span>
            </div>
            <div className="rc-surface rounded-[2rem] p-5">
              <ShieldCheck className="text-[var(--rc-warm)]" size={24} />
              <h3 className="mt-5 text-xl font-black text-white">School scoped</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">Students enter the GoUnion and Teaky space for their own institution.</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/45"><CheckCircle2 size={14} /> Architecture ready</div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};
