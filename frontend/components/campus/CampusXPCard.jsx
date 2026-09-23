import React from "react";
import { Sparkles } from "lucide-react";

export const CampusXPCard = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Campus XP</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-black text-white">0</span>
        <span className="text-xs font-bold text-white/30">XP</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-3">
        <div className="h-full w-0 rounded-full bg-primary/60 transition-all" />
      </div>
      <p className="text-xs text-white/35 leading-relaxed">
        Earn XP through meaningful campus participation.
      </p>
    </div>
  );
};
