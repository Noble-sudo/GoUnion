import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, MessageSquare, Download, X, Smartphone, Bell, ChevronRight, Zap } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: "Welcome to Reconnected.",
    description: "Your digital campus is ready. Let's take a quick look around.",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    title: "The Pulse",
    description: "Your campus feed. See what's happening, watch stories, and join the conversation in real-time.",
    icon: Home,
    color: "text-[var(--rc-go)]",
    bg: "bg-[var(--rc-go)]/10",
  },
  {
    title: "Konnect",
    description: "Go beyond your campus. Discover students, communities, and conversations from other universities.",
    icon: Compass,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Quick Access",
    description: "Tap the glowing 'R' at the bottom of your screen anytime to create posts, invite friends, or explore.",
    icon: Smartphone,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Install the App",
    description: "Get the full experience. Install Reconnected to your home screen for push notifications and instant access.",
    icon: Download,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    isInstallStep: true,
  }
];

export const WelcomeTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('reconnected_tour_complete');
    if (!hasCompletedTour) {
      // Small delay so it doesn't pop up immediately on first load jarringly
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const completeTour = () => {
    localStorage.setItem('reconnected_tour_complete', 'true');
    setIsVisible(false);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("To install, tap 'Share' then 'Add to Home Screen' (iOS), or use your browser menu to install (Android/Desktop).");
      completeTour();
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    completeTour();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0a0a0c] p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--rc-go)]/20 blur-[60px] rounded-full pointer-events-none" />
          
          <button 
            onClick={completeTour}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${step.bg}`}>
                  <step.icon size={36} className={step.color} />
                </div>
                
                <h3 className="mb-3 font-serif text-2xl font-black text-white">
                  {step.title}
                </h3>
                
                <p className="text-sm leading-relaxed text-white/60 mb-8 px-2">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex w-full flex-col gap-3">
              {step.isInstallStep ? (
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleInstallClick}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--rc-go)] py-4 text-sm font-black text-black shadow-[0_0_20px_rgba(199,249,79,0.3)] hover:scale-[1.02] transition-transform"
                  >
                    <Download size={18} />
                    Install App
                  </button>
                  <button 
                    onClick={completeTour}
                    className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest py-2"
                  >
                    Not now
                  </button>
                </div>
              ) : (
                <button 
                  onClick={nextStep}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-black text-black hover:bg-white/90 transition-colors"
                >
                  {currentStep === 0 ? "Let's Go" : "Next"}
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Pagination dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep 
                      ? "w-6 bg-white" 
                      : i < currentStep 
                        ? "w-1.5 bg-white/40" 
                        : "w-1.5 bg-white/10"
                  }`} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
