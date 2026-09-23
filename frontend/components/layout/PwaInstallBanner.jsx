import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePwaStore } from '../../store/pwaStore';

export const PwaInstallBanner = () => {
  const { installPrompt, setInstallPrompt, clearInstallPrompt, setInstalled } = usePwaStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    // Check if dismissed previously
    if (localStorage.getItem('pwa_install_dismissed')) {
      setIsDismissed(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    setIsIOS(isIOSDevice && webkit && !ua.match(/CriOS/i));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      clearInstallPrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [clearInstallPrompt, setInstallPrompt, setInstalled]);

  const handleInstallClick = async () => {
    if (forceShow) {
      alert("This is a preview! On an actual Android device, this button will open the native App Install prompt.");
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      clearInstallPrompt();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Only show if we have a prompt (Android/Chrome) and not dismissed, and not already installed
  const forceShow = window.location.search.includes("show_pwa=true");
  if ((!installPrompt && !forceShow) || isDismissed || isIOS) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[420px] z-[9999] px-5 py-4 bg-[var(--rc-go)] text-black shadow-[0_10px_40px_rgba(199,249,79,0.3)] rounded-2xl flex items-center justify-between border border-black/20"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-black text-white rounded-[10px] flex items-center justify-center font-serif text-xl font-black italic shadow-sm">
            R
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider">Install Reconnected</h4>
            <p className="text-xs font-semibold opacity-70">Add to your home screen for a better experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Download size={14} />
            Install
          </button>
          <button 
            onClick={handleDismiss}
            className="p-1.5 text-black/50 hover:text-black hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
