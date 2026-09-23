import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, ArrowDown } from 'lucide-react';

/**
 * Detects iOS Safari users who haven't installed the PWA
 * and shows them a guided "Add to Home Screen" prompt.
 */
export const IosInstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when NOT already running as PWA
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|chrome/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = localStorage.getItem('ios_install_dismissed');

    if (isIos && isSafari && !isStandalone && !dismissed) {
      // Delay showing it so users aren't hit immediately on first visit
      const timer = setTimeout(() => setShow(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    // Don't show again for 7 days
    localStorage.setItem('ios_install_dismissed', Date.now().toString());
  };

  // Check if dismissal has expired (7 days)
  useEffect(() => {
    const dismissedAt = localStorage.getItem('ios_install_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('ios_install_dismissed');
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#111114] border-t border-white/10 rounded-t-[2rem] p-6 pb-10 safe-area-pb"
          >
            {/* Handle bar */}
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-white/15" />

            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* App icon + title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <span className="font-black text-black text-2xl">R</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Install Reconnected</h2>
                <p className="text-xs text-white/40 mt-0.5">Get the full app experience on your iPhone</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { emoji: '🔔', label: 'Push Notifications' },
                { emoji: '⚡', label: 'Instant Launch' },
                { emoji: '📱', label: 'Full Screen' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-xl">{item.emoji}</span>
                  <p className="text-[10px] font-bold text-white/50 mt-1.5 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Share size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">1. Tap the Share button</p>
                  <p className="text-xs text-white/40 mt-0.5">It's at the bottom of your Safari browser</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Plus size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">2. Tap "Add to Home Screen"</p>
                  <p className="text-xs text-white/40 mt-0.5">Scroll down in the share menu to find it</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-black text-sm">Add</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">3. Tap "Add" to confirm</p>
                  <p className="text-xs text-white/40 mt-0.5">Reconnected will appear on your home screen</p>
                </div>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              Maybe Later
            </button>

            {/* Arrow pointing to Safari share button */}
            <div className="flex justify-center mt-4">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown size={20} className="text-blue-400" />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
