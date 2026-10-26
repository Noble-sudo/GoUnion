import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Store, Plus, ShoppingBag } from "lucide-react";
import { api, getFullUrl } from "../services/api";
import { useAuthStore } from "../store";
import { CATEGORIES } from "../components/teaky/shopUtils";

export const Teaky = () => {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 350);
    return () => clearTimeout(t);
  }, [text]);

  const { data: shops, status } = useQuery({
    queryKey: ["shops", q, category],
    queryFn: () => api.shops.list({ q, category }),
  });
  const { data: mine } = useQuery({ queryKey: ["my-shop"], queryFn: api.shops.mine, enabled: !!user });

  return (
    <div className="w-full pb-24">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 md:px-0">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-white">
            <ShoppingBag size={22} className="text-[var(--rc-teaky)]" /> Teaky
          </h1>
          <p className="mt-1 text-sm text-white/45">Open a shop for free, or browse what others are selling.</p>
        </div>
        <Link
          to="/teaky/my-shop"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-black active:scale-95"
        >
          {mine ? <Store size={16} /> : <Plus size={16} />}
          {mine ? "My shop" : "Open your shop"}
        </Link>
      </div>

      <div className="px-4 pt-4 md:px-0">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3">
          <Search size={18} className="text-white/40" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search shops and products"
            className="h-11 w-full bg-transparent text-[16px] text-white placeholder:text-white/30 outline-none"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {["All"].concat(CATEGORIES).map((c) => {
            const active = (c === "All" && !category) || c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c === "All" ? "" : c)}
                className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold " + (active ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/50")}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px bg-white/5 md:gap-3 md:bg-transparent">
        {status === "pending" &&
          [1, 2, 3, 4].map((k) => <div key={k} className="aspect-[4/5] animate-pulse bg-white/[0.04] md:rounded-2xl" />)}
        {status === "success" &&
          shops.map((shop) => (
            <Link key={shop.id} to={"/shop/" + shop.slug} className="block overflow-hidden bg-[#0a0a0c] md:rounded-2xl md:border md:border-white/10">
              <div className="relative aspect-square bg-white/[0.04]">
                {shop.previews && shop.previews[0] ? (
                  <img src={getFullUrl(shop.previews[0])} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : shop.logo ? (
                  <img src={getFullUrl(shop.logo)} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/20"><Store size={40} /></div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-white">{shop.name}</p>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  {shop.category} {"-"} {shop.product_count} {shop.product_count === 1 ? "item" : "items"}
                </p>
              </div>
            </Link>
          ))}
      </div>

      {status === "error" && <p className="px-4 py-10 text-center text-sm text-white/45">Could not load shops. Try again in a moment.</p>}
      {status === "success" && shops.length === 0 && (
        <div className="px-6 py-16 text-center">
          <Store className="mx-auto mb-3 text-[var(--rc-teaky)]" size={36} />
          <h2 className="text-lg font-black text-white">{q || category ? "No shops match that" : "No shops yet"}</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/45">
            {q || category ? "Try a different word or category." : "Be the first to open a shop on Teaky. It takes a minute."}
          </p>
        </div>
      )}
    </div>
  );
};
