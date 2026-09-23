import React from "react";
import { Flame } from "lucide-react";

export const CampusStreakCard = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={14} className="text-orange-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Campus Streak</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-black text-white">0</span>
        <span className="text-xs font-bold text-white/30">days</span>
      </div>
      <p className="text-xs text-white/35 leading-relaxed">
        Your campus maintains a streak when students show up consistently.
      </p>
    </div>
  );
};
