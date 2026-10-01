import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store";
import { Users, ShoppingBag, Shield, Activity, Zap, Globe, Download, Smartphone, Apple, GraduationCap, Check } from "lucide-react";

const SHOWCASE_IMAGES = [
  { src: "/showcase-feed-full.png", label: "Pulse Feed", description: "Your campus timeline" },
  { src: "/showcase-quick-full.png", label: "Quick Access", description: "Everything one tap away" },
  { src: "/showcase-chat-full.png", label: "Real-time Chat", description: "Instant messaging" },
  { src: "/showcase-notifications-full.png", label: "Notifications", description: "Stay in the loop" },
  { src: "/showcase-profile-full.png", label: "Your Profile", description: "Your digital identity" },
  { src: "/showcase-settings-full.png", label: "Settings", description: "Full control" },
];

const PhoneFrame = ({ children, className = "", scale = 1 }) => (
  <div
    className={`relative rounded-[3rem] border-[5px] border-zinc-800/80 bg-black overflow-hidden shadow-2xl ${className}`}
    style={{ transform: `scale(${scale})` }}
  >
    {/* Dynamic Island */}
    <div className="absolute top-0 w-full h-8 bg-black z-20 flex justify-center pt-2">
      <div className="w-[90px] h-[22px] bg-zinc-900 rounded-full" />
    </div>
    {/* Home Indicator */}
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-20" />
    {children}
  </div>
);

const AutoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-[340px] max-w-[94vw] sm:w-[390px] drop-shadow-2xl">
        <div className="w-full relative overflow-visible">
          <AnimatePresence custom={direction} mode="wait">
            <motion.img
              key={currentIndex}
              src={SHOWCASE_IMAGES[currentIndex].src}
              alt={SHOWCASE_IMAGES[currentIndex].label}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-auto block"
              draggable={false}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Caption + Dots */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-white font-black text-lg">{SHOWCASE_IMAGES[currentIndex].label}</p>
            <p className="text-white/40 text-sm">{SHOWCASE_IMAGES[currentIndex].description}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-2">
          {SHOWCASE_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex ? "w-8 bg-[var(--rc-go)]" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ThreePhoneShowcase = () => {
  const [centerIdx, setCenterIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCenterIdx((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const leftIdx = (centerIdx - 1 + SHOWCASE_IMAGES.length) % SHOWCASE_IMAGES.length;
  const rightIdx = (centerIdx + 1) % SHOWCASE_IMAGES.length;

  return (
    <div className="relative flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[460px] bg-[var(--rc-go)]/15 blur-[150px] rounded-full z-0 pointer-events-none" />
      
      {/* Left phone */}
      <motion.div
        key={`left-${leftIdx}`}
        initial={{ opacity: 0, x: -40, rotate: -8 }}
        animate={{ opacity: 0.5, x: 0, rotate: -8 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 hidden lg:block -mr-10"
      >
        <div className="w-[300px] xl:w-[330px] drop-shadow-2xl">
          <img src={SHOWCASE_IMAGES[leftIdx].src} alt="" className="w-full h-auto block" />
        </div>
      </motion.div>

      {/* Center phone */}
      <motion.div
        className="relative z-20"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-[390px] lg:w-[430px] xl:w-[470px] drop-shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={centerIdx}
              src={SHOWCASE_IMAGES[centerIdx].src}
              alt={SHOWCASE_IMAGES[centerIdx].label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-auto block"
            />
          </AnimatePresence>
        </div>
        {/* Reflection glow */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[200px] h-[80px] bg-[var(--rc-go)]/20 blur-[60px] rounded-full pointer-events-none" />
      </motion.div>

      {/* Right phone */}
      <motion.div
        key={`right-${rightIdx}`}
        initial={{ opacity: 0, x: 40, rotate: 8 }}
        animate={{ opacity: 0.5, x: 0, rotate: 8 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 hidden lg:block -ml-10"
      >
        <div className="w-[300px] xl:w-[330px] drop-shadow-2xl">
          <img src={SHOWCASE_IMAGES[rightIdx].src} alt="" className="w-full h-auto block" />
        </div>
      </motion.div>
    </div>
  );
};

const APP_STEPS = [
  { icon: Download, title: "Download the app", body: "Start from your phone so Reconnected feels native from the first tap." },
  { icon: GraduationCap, title: "Choose your campus", body: "Find your university, polytechnic, or college and enter the right community." },
  { icon: Shield, title: "Verify your identity", body: "Confirm you are a real student before you post, chat, or join groups." },
  { icon: Users, title: "Meet your people", body: "Follow campus conversations, join circles, and message classmates naturally." },
];

const AppFirstSection = ({ itemVariants, onInstall, isInstalled, showIosHint, onCloseIosHint }) => (
  <section className="px-5 md:px-8 pb-28 pt-10 relative z-20">
    {/* iOS Add to Home Screen hint */}
    <AnimatePresence>
      {showIosHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-end bg-black/60 backdrop-blur-sm p-4 pb-8"
          onClick={onCloseIosHint}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f0f12] p-6 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[var(--rc-go)]/10">
              <Smartphone size={28} className="text-[var(--rc-go)]" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Install on iPhone</h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Tap the <span className="font-bold text-white">Share</span> button at the bottom of Safari, then scroll down and tap <span className="font-bold text-white">"Add to Home Screen"</span>.
            </p>
            {/* Arrow pointing down */}
            <div className="flex justify-center text-3xl mb-2">⬇</div>
            <button onClick={onCloseIosHint} className="mt-2 text-xs text-white/40 hover:text-white font-bold uppercase tracking-widest">Got it</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="max-w-6xl mx-auto rounded-[2.5rem] border border-[var(--rc-go)]/15 bg-gradient-to-br from-[#0c100a] to-[#040506] p-8 shadow-[0_24px_70px_rgba(199,249,79,0.06)] md:p-12 lg:p-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--rc-go)]/10 blur-[140px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 blur-[100px] translate-y-1/3 -translate-x-1/3 rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] relative z-10">
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--rc-go)]/30 bg-[var(--rc-go)]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--rc-go)]">
            <Smartphone size={14} />
            Best Experience
          </div>
          <h2 className="font-serif text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl mb-6">
            Get the native feel.
          </h2>
          <p className="text-lg leading-relaxed text-white/60 mb-8 max-w-lg">
            Reconnected is built for your phone. Install the app for instant notifications, smoother navigation, and offline access. It takes two seconds.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {isInstalled ? (
              <div className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[var(--rc-go)]/20 border border-[var(--rc-go)]/30 px-8 text-sm font-black text-[var(--rc-go)]">
                <Check size={18} /> App Installed!
              </div>
            ) : (
              <button
                onClick={onInstall}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-black shadow-lg shadow-white/10 transition hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={18} /> Install App
              </button>
            )}
            <Link to="/login" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 text-sm font-bold text-white transition hover:bg-white/10">
              Continue in Browser
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 items-center text-xs font-bold text-white/40">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[var(--rc-go)]" /> Push Notifications</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[var(--rc-go)]" /> Real-time Chat</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[var(--rc-go)]" /> Instant Access</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative">
          {APP_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-[var(--rc-go)]/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--rc-go)]/5 blur-[30px] rounded-full group-hover:bg-[var(--rc-go)]/10 transition-colors" />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--rc-go)]/20 to-transparent text-[var(--rc-go)] border border-[var(--rc-go)]/20 shadow-sm relative z-10">
                <step.icon size={22} />
              </div>
              <h3 className="text-lg font-black text-white mb-2 relative z-10">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/50 relative z-10">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }
    // Read the already-captured prompt (set in index.html before React mounted)
    if (window.deferredPWAInstallPrompt) {
      setInstallPrompt(window.deferredPWAInstallPrompt);
    }
    // Also wire a callback in case the event fires later
    window.updatePwaStorePrompt = (e) => setInstallPrompt(e);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => {
      window.updatePwaStorePrompt = null;
    };
  }, []);

  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) { setShowIosHint(true); return; }
    if (!installPrompt) { window.location.href = '/download'; return; }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
  };

  const features = [
    { icon: Shield, title: "Verified Identity", desc: "Every user is a verified university student. No bots, no fakes — just real connections.", accent: "white" },
    { icon: Zap, title: "Real-time Messaging", desc: "Lightning-fast direct messages, voice notes, group chats, and typing indicators.", accent: "var(--rc-go)" },
    { icon: Globe, title: "Konnect Network", desc: "Break outside your campus. Discover students and communities across other universities.", accent: "var(--rc-teaky)" },
    { icon: Activity, title: "Live Campus Feed", desc: "Post drops, share moments, react, and see what's trending across your campus in real-time.", accent: "white" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[var(--rc-go)] selection:text-black overflow-hidden font-sans">
      
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.08]" 
           style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/60 to-[#020202]" />
      </div>
      
      {/* Ambient Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--rc-go)]/8 blur-[180px] pointer-events-none z-0" />
      <div className="fixed bottom-[-30%] right-[-15%] w-[700px] h-[700px] rounded-full bg-[var(--rc-teaky)]/6 blur-[200px] pointer-events-none z-0" />
      <div className="fixed top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 md:px-12 md:py-8 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            <span className="font-serif text-2xl font-black italic">R</span>
          </div>
          <span className="text-xl font-black tracking-tighter">RECONNECTED</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/download" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black hover:bg-white/90 transition-colors">
            Get the app <Download size={14} />
          </Link>
        </motion.div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-5 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col items-center justify-center min-h-[80vh] text-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 mb-10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[var(--rc-go)] shadow-[0_0_12px_var(--rc-go)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Now Live for Nigerian Universities</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tight leading-[0.88] mb-8">
              <span className="block text-white">Your campus.</span>
              <span className="block text-white/70 mt-2">Your people.</span>
              <motion.span 
                className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--rc-go)] via-white to-[var(--rc-teaky)]"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Connected.
              </motion.span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-8 mb-12 text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
              The exclusive digital ecosystem for verified university students. Communities, conversations, events, and everything campus - in one mobile app.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/download" className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black text-black overflow-hidden w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Download for your phone</span>
                <Download size={18} className="relative z-10" />
              </Link>
              <Link to="/login" className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-bold text-white/70 hover:text-white hover:bg-white/[0.06] transition-all w-full sm:w-auto backdrop-blur-sm">
                Already have an account?
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <AppFirstSection itemVariants={itemVariants} onInstall={handleInstallClick} isInstalled={isInstalled} showIosHint={showIosHint} onCloseIosHint={() => setShowIosHint(false)} />

        {/* Product Showcase - 3 Phone Spread */}
        <section className="px-5 md:px-8 pb-32 pt-8 relative z-20">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-5xl font-black tracking-tight mb-4">
                See it in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--rc-go)] to-white">action.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">Real screenshots from the Reconnected platform.</p>
            </motion.div>

            {/* Desktop: 3-phone showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
            >
              <ThreePhoneShowcase />
            </motion.div>

            {/* Mobile: single phone carousel */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:hidden"
            >
              <AutoCarousel />
            </motion.div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section className="px-5 md:px-8 py-24 md:py-32 relative z-20 bg-[#050507]/80 border-y border-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="font-serif text-4xl md:text-6xl font-black tracking-tight mb-6">
                Two products.<br/>
                <span className="text-white/60">One ecosystem.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">Switch seamlessly between your social campus and your marketplace.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* GoUnion */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative rounded-[2rem] border border-[var(--rc-go)]/10 bg-[var(--rc-go)]/[0.02] p-8 md:p-12 overflow-hidden hover:border-[var(--rc-go)]/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--rc-go)]/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--rc-go)]/10 flex items-center justify-center border border-[var(--rc-go)]/20">
                      <Users size={28} className="text-[var(--rc-go)]" />
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[var(--rc-go)]/30 bg-[var(--rc-go)]/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--rc-go)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--rc-go)] mr-2 animate-pulse" /> Live
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Reconnected</h3>
                  <p className="text-white/45 text-base leading-relaxed max-w-sm">The vibrant social heart of your university. Communities, live chats, stories, and events — the digital quad where everyone meets.</p>
                </div>
              </motion.div>

              {/* Teaky */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative rounded-[2rem] border border-[var(--rc-teaky)]/10 bg-[var(--rc-teaky)]/[0.02] p-8 md:p-12 overflow-hidden hover:border-[var(--rc-teaky)]/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--rc-teaky)]/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--rc-teaky)]/10 flex items-center justify-center border border-[var(--rc-teaky)]/20">
                      <ShoppingBag size={28} className="text-[var(--rc-teaky)]" />
                    </div>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Teaky</h3>
                  <p className="text-white/45 text-base leading-relaxed max-w-sm">The dedicated campus marketplace. Buy, sell, and trade safely with verified students. Built right in.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="px-5 md:px-8 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-5xl font-black tracking-tight mb-4">Built different.</h2>
              <p className="text-white/40 text-lg max-w-lg mx-auto">Every feature designed for the African campus experience.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group p-8 rounded-[2rem] border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
                    <feature.icon size={140} />
                  </div>
                  <div className="relative z-10">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `color-mix(in srgb, ${feature.accent} 10%, transparent)` }}
                    >
                      <feature.icon size={22} style={{ color: feature.accent }} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{feature.title}</h3>
                    <p className="text-white/40 leading-relaxed text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 md:px-8 py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--rc-go)]/5 to-transparent pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <h2 className="font-serif text-4xl md:text-6xl font-black tracking-tight mb-6">
              Ready to join?
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">Your campus community is already here. Download Reconnected, choose your institution, and get verified in minutes.</p>
            <Link to="/download" className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 text-base font-black text-black shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-all">
              Download Reconnected
              <Download size={20} />
            </Link>
          </motion.div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-12 text-center relative z-10 bg-[#020202]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
            <span className="font-serif text-xl font-black italic opacity-50">R</span>
          </div>
          <span className="text-sm font-black tracking-tighter text-white/30">RECONNECTED</span>
        </div>
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Reconnected Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
