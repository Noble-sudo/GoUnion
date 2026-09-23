import React from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, PackageSearch, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useAuthStore } from "../store";

const futureSignals = [
  ["Student listings", "Campus-first buying, selling, and trading."],
  ["Verified identity", "Marketplace trust connected to Reconnected accounts."],
  ["Local exchange", "Designed around students meeting where they already belong."],
];

export const Teaky = () => {
  const { user } = useAuthStore();
  const campusName = user?.university || "your institution";

  return (
    <div className="min-h-[calc(100vh-64px)] px-1 pb-24 pt-4 md:min-h-screen md:px-0 md:pb-10">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
        className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="rc-surface-strong rounded-[2rem] p-6 sm:p-8">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(104,212,255,0.24)] bg-[var(--rc-teaky-soft)] text-[var(--rc-teaky)]">
                <ShoppingBag size={23} />
              </span>
              <div>
                <p className="rc-label">Reconnected product</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Teaky</h1>
              </div>
            </div>
            <span className="rounded-full border border-[rgba(104,212,255,0.24)] bg-[var(--rc-teaky-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--rc-teaky)]">
              Coming soon
            </span>
          </div>

          <p className="rc-label text-[var(--rc-teaky)]">Teaky for {campusName}</p>
          <h2 className="mt-4 font-serif text-5xl leading-none text-white sm:text-6xl">Buy. Sell. Trade.</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
            We are building a marketplace designed around students at {campusName}. Teaky is part of Reconnected, but it has not launched yet.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {futureSignals.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <CheckCircle2 className="mb-4 text-[var(--rc-teaky)]" size={18} />
                <h3 className="text-sm font-black text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/45">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="rc-surface rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <PackageSearch className="text-[var(--rc-teaky)]" size={24} />
              <h3 className="text-xl font-black text-white">Launch status</h3>
            </div>
            <div className="mt-6 space-y-3">
              {["Products", "Sellers", "Checkout", "Orders"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
                  <span className="text-sm font-bold text-white/70">{item}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-white/30">Not live</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rc-surface rounded-[2rem] p-6">
            <ShieldCheck className="text-[var(--rc-warm)]" size={24} />
            <h3 className="mt-5 text-xl font-black text-white">Built on Reconnected identity</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">
              The future marketplace will rely on the same account, campus, and trust layer students already use in GoUnion at {campusName}.
            </p>
          </div>

          <div className="rc-surface rounded-[2rem] p-6">
            <div className="flex items-center gap-3 text-white">
              <Bell size={20} />
              <Sparkles size={20} className="text-[var(--rc-teaky)]" />
            </div>
            <p className="mt-5 text-sm leading-6 text-white/48">
              Notifications for Teaky launch are not wired yet. This page is the foundation for the product destination.
            </p>
          </div>
        </aside>
      </motion.section>
    </div>
  );
};
