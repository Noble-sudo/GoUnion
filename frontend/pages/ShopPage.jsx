import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Share2, MessageCircle, Store, X, Settings, Phone } from "lucide-react";
import { api, getFullUrl } from "../services/api";
import { useAuthStore } from "../store";
import { useToast } from "../components/ui/Toast";
import { formatPrice, whatsappLink, shareShop } from "../components/teaky/shopUtils";

const WhatsAppIcon = ({ size = 18 }) => <Phone size={size} />;

export const ShopPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [active, setActive] = useState(null);

  const { data: shop, status } = useQuery({
    queryKey: ["shop", slug],
    queryFn: () => api.shops.get(slug),
    retry: false,
  });

  const isOwner = !!(user && shop && shop.owner && String(shop.owner.id) === String(user.id));

  const chatLink = (owner) =>
    isAuthenticated && owner
      ? "/messages?user=" + owner.id + "&name=" + encodeURIComponent(owner.full_name || owner.username) + "&avatar=" + encodeURIComponent(owner.avatar || "")
      : "/login";

  const waText = (product) =>
    "Hi, I saw " + (product ? product.title + " (" + formatPrice(product.price) + ") in " : "") + shop.name + " on Konnect. Is it available?";

  const content = (
    <div className="w-full pb-24">
      {status === "pending" && <div className="m-4 h-40 animate-pulse rounded-2xl bg-white/[0.04]" />}
      {status === "error" && (
        <div className="px-6 py-20 text-center">
          <Store className="mx-auto mb-3 text-white/30" size={40} />
          <h1 className="text-xl font-black text-white">Shop not found</h1>
          <p className="mt-2 text-sm text-white/45">The link may be wrong, or the shop was closed.</p>
          <Link to="/teaky" className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-black">Browse Teaky</Link>
        </div>
      )}
      {status === "success" && (
        <>
          <div className="h-28 w-full bg-gradient-to-br from-[#0f3a4a] to-[#0a0a0c]">
            {shop.banner && <img src={getFullUrl(shop.banner)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="px-4">
            <div className="-mt-9 flex items-end justify-between">
              <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-4 border-[#030303] bg-[#15151a]">
                {shop.logo ? <img src={getFullUrl(shop.logo)} alt="" className="h-full w-full object-cover" /> : <Store className="text-white/30" size={30} />}
              </div>
              <div className="flex gap-2 pb-1">
                {isOwner && (
                  <Link to="/teaky/my-shop" className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-sm font-bold text-white">
                    <Settings size={16} /> Manage
                  </Link>
                )}
                <button onClick={() => shareShop(shop, toast)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white" aria-label="Share shop">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-black text-white">{shop.name}</h1>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-[var(--rc-teaky)]">{shop.category}</p>
            {shop.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">{shop.description}</p>}
            {shop.owner && (
              <Link to={isAuthenticated ? "/profile/" + shop.owner.username : "/login"} className="mt-3 inline-flex items-center gap-2 text-xs text-white/45">
                <img src={shop.owner.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(shop.owner.full_name)} alt="" className="h-5 w-5 rounded-full object-cover" />
                by {shop.owner.full_name}
              </Link>
            )}
            {!isOwner && (
              <div className="mt-4 flex gap-2">
                {shop.whatsapp && (
                  <a href={whatsappLink(shop.whatsapp, waText(null))} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-black">
                    <WhatsAppIcon /> WhatsApp
                  </a>
                )}
                {shop.owner && (
                  <Link to={chatLink(shop.owner)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold text-white">
                    <MessageCircle size={18} /> Chat on Konnect
                  </Link>
                )}
              </div>
            )}
          </div>

          <h2 className="mt-6 px-4 text-sm font-black uppercase tracking-widest text-white/40">Products ({shop.products.length})</h2>
          {shop.products.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-white/40">No products yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-px bg-white/5 md:gap-3 md:bg-transparent">
              {shop.products.map((p) => (
                <button key={p.id} onClick={() => setActive(p)} className="block overflow-hidden bg-[#0a0a0c] text-left md:rounded-2xl md:border md:border-white/10">
                  <div className="relative aspect-square bg-white/[0.04]">
                    {p.images && p.images[0] ? <img src={getFullUrl(p.images[0])} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-white/20"><Store size={32} /></div>}
                    {!p.in_stock && <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black uppercase text-white">Sold out</span>}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                    <p className="mt-0.5 text-sm font-black text-[var(--rc-teaky)]">{formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {active && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 md:items-center md:p-4" onClick={() => setActive(null)}>
              <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#111113] md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setActive(null)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white" aria-label="Close">
                  <X size={18} />
                </button>
                {active.images && active.images.length > 0 ? (
                  <div className="flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
                    {active.images.map((src) => (
                      <img key={src} src={getFullUrl(src)} alt="" className="aspect-square w-full shrink-0 snap-center object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-white/[0.04] text-white/20"><Store size={40} /></div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-black text-white">{active.title}</h3>
                  <p className="mt-1 text-xl font-black text-[var(--rc-teaky)]">{formatPrice(active.price)}</p>
                  {!active.in_stock && <p className="mt-1 text-xs font-bold uppercase text-red-400">Sold out</p>}
                  {active.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">{active.description}</p>}
                  {!isOwner && (
                    <div className="mt-4 flex gap-2">
                      {shop.whatsapp && (
                        <a href={whatsappLink(shop.whatsapp, waText(active))} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-bold text-black">
                          <WhatsAppIcon /> WhatsApp
                        </a>
                      )}
                      {shop.owner && (
                        <Link to={chatLink(shop.owner)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold text-white">
                          <MessageCircle size={18} /> Chat
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isAuthenticated) return content;
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-[#030303] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-black">K</span>
          <span className="text-sm font-black tracking-tight">Konnect</span>
        </Link>
        <Link to="/login" className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold">Join Konnect</Link>
      </div>
      {content}
    </div>
  );
};
