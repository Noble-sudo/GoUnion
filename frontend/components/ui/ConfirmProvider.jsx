import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});

  const confirm = useCallback((confirmOptions) => {
    return new Promise((resolve) => {
      setOptions({
        ...confirmOptions,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={options.onCancel} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] bg-[#111113] border border-white/10 shadow-2xl p-6 text-center">
              <h2 className="font-serif text-2xl font-bold text-white mb-2">{options.title || "Confirm Action"}</h2>
              <p className="text-sm text-white/60 mb-8">{options.message}</p>
              <div className="flex items-center gap-3">
                <button onClick={options.onCancel} className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  {options.cancelText || "Cancel"}
                </button>
                <button onClick={options.onConfirm} className={`flex-1 rounded-xl py-3 text-sm font-bold transition \${options.isDanger ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-white hover:bg-white/90 text-black'}`}>
                  {options.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
