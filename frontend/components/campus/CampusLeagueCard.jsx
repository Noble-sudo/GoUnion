import React from "react";
import { Trophy } from "lucide-react";

export const CampusLeagueCard = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Campus League</span>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/40">Coming Soon</span>
      </div>
      <p className="text-xs text-white/35 leading-relaxed mb-3">
        Universities compete through genuine student participation.
      </p>
      <button className="text-xs font-bold text-primary/70 hover:text-primary transition-colors">
        Learn more →
      </button>
    </div>
  );
};
