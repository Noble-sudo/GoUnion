import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, Plus, Share2, Trash2, ImagePlus, X, ExternalLink } from "lucide-react";
import { api, getFullUrl, getApiErrorMessage } from "../services/api";
import { useToast } from "../components/ui/Toast";
import { CATEGORIES, formatPrice, shareShop, shopUrl } from "../components/teaky/shopUtils";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[16px] text-white placeholder:text-white/30 outline-none focus:border-primary/60";
const labelClass = "mb-1.5 mt-4 block text-xs font-bold uppercase tracking-widest text-white/40";

const ShopForm = ({ initial, onSubmit, pending, submitLabel }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: (initial && initial.name) || "",
    category: (initial && initial.category) || "Other",
    whatsapp: (initial && initial.whatsapp) || "",
    description: (initial && initial.description) || "",
    logo: (initial && initial.logo) || "",
  });
  const [uploading, setUploading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickLogo = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.media.upload(file);
      setForm((f) => ({ ...f, logo: url }));
    } catch (err) {
      toast(getApiErrorMessage(err, "Could not upload the picture"), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="px-4"
    >
      <div className="flex items-center gap-4">
        <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/[0.04]">
          {form.logo ? <img src={getFullUrl(form.logo)} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="text-white/35" size={24} />}
          <input type="file" accept="image/*" className="hidden" onChange={pickLogo} />
        </label>
        <p className="text-xs text-white/45">{uploading ? "Uploading..." : "Shop picture (optional)"}</p>
      </div>
      <label className={labelClass}>Shop name</label>
      <input className={inputClass} value={form.name} onChange={set("name")} maxLength={40} placeholder="e.g. Ella's Wears" required />
      <label className={labelClass}>Category</label>
      <select className={inputClass} value={form.category} onChange={set("category")}>
        {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111113]">{c}</option>)}
      </select>
      <label className={labelClass}>WhatsApp number</label>
      <input className={inputClass} value={form.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="08012345678" />
      <p className="mt-1.5 text-xs text-white/35">Buyers tap a button to message you. Shown publicly on your shop.</p>
      <label className={labelClass}>About your shop</label>
      <textarea className={inputClass + " min-h-[88px] resize-none"} value={form.description} onChange={set("description")} maxLength={500} placeholder="What do you sell? Where do you deliver?" />
      <button type="submit" disabled={pending || uploading} className="mt-6 h-12 w-full rounded-xl bg-primary text-sm font-black text-black disabled:opacity-50">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

const ProductForm = ({ defaultCategory, onSubmit, onCancel, pending }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", price: "", description: "", category: defaultCategory || "Other", images: [] });
  const [uploading, setUploading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickImages = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - form.images.length);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await api.media.upload(file));
      setForm((f) => ({ ...f, images: f.images.concat(urls.filter(Boolean)).slice(0, 6) }));
    } catch (err) {
      toast(getApiErrorMessage(err, "Could not upload a picture"), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="mx-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white">New product</h3>
        <button type="button" onClick={onCancel} className="text-white/45" aria-label="Cancel"><X size={20} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {form.images.map((src) => (
          <div key={src} className="relative h-20 w-20 overflow-hidden rounded-xl">
            <img src={getFullUrl(src)} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((x) => x !== src) })} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white" aria-label="Remove picture">
              <X size={12} />
            </button>
          </div>
        ))}
        {form.images.length < 6 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 text-white/40">
            <ImagePlus size={22} />
            <span className="mt-1 text-[10px]">{uploading ? "Uploading" : "Add"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
          </label>
        )}
      </div>
      <label className={labelClass}>Name</label>
      <input className={inputClass} value={form.title} onChange={set("title")} maxLength={80} placeholder="e.g. Black hoodie (size L)" required />
      <label className={labelClass}>Price (naira)</label>
      <input className={inputClass} value={form.price} onChange={set("price")} inputMode="decimal" placeholder="5000" required />
      <label className={labelClass}>Description</label>
      <textarea className={inputClass + " min-h-[72px] resize-none"} value={form.description} onChange={set("description")} maxLength={1000} placeholder="Size, colour, condition..." />
      <button type="submit" disabled={pending || uploading} className="mt-5 h-12 w-full rounded-xl bg-primary text-sm font-black text-black disabled:opacity-50">
        {pending ? "Saving..." : "Add product"}
      </button>
    </form>
  );
};

export const MyShop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: shop, status } = useQuery({ queryKey: ["my-shop"], queryFn: api.shops.mine });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["my-shop"] });
    queryClient.invalidateQueries({ queryKey: ["shops"] });
    queryClient.invalidateQueries({ queryKey: ["shop"] });
  };
  const onError = (err) => toast(getApiErrorMessage(err, "Something went wrong"), "error");

  const createShop = useMutation({
    mutationFn: api.shops.create,
    onSuccess: () => { refresh(); toast("Your shop is open", "success"); },
    onError,
  });
  const updateShop = useMutation({
    mutationFn: api.shops.update,
    onSuccess: () => { refresh(); setEditing(false); toast("Shop updated", "success"); },
    onError,
  });
  const addProduct = useMutation({
    mutationFn: api.shops.addProduct,
    onSuccess: () => { refresh(); setAdding(false); toast("Product added", "success"); },
    onError,
  });
  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => api.shops.updateProduct(id, data),
    onSuccess: refresh,
    onError,
  });
  const deleteProduct = useMutation({
    mutationFn: api.shops.deleteProduct,
    onSuccess: () => { refresh(); toast("Product removed", "success"); },
    onError,
  });

  if (status === "pending") return <div className="m-4 h-40 animate-pulse rounded-2xl bg-white/[0.04]" />;

  if (!shop) {
    return (
      <div className="w-full pb-24">
        <div className="px-4 pt-4">
          <h1 className="font-serif text-2xl font-bold text-white">Open your shop</h1>
          <p className="mt-1 text-sm text-white/45">Free. You get your own link to share anywhere.</p>
        </div>
        <div className="mt-2">
          <ShopForm onSubmit={(f) => createShop.mutate(f)} pending={createShop.isPending} submitLabel="Open my shop" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      <div className="px-4 pt-4">
        <h1 className="font-serif text-2xl font-bold text-white">{shop.name}</h1>
        <p className="mt-1 break-all text-xs text-white/40">{shopUrl(shop.slug)}</p>
        <div className="mt-3 flex gap-2">
          <Link to={"/shop/" + shop.slug} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 text-sm font-bold text-white">
            <ExternalLink size={16} /> View shop
          </Link>
          <button onClick={() => shareShop(shop, toast)} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 text-sm font-bold text-white">
            <Share2 size={16} /> Share link
          </button>
          <button onClick={() => setEditing(!editing)} className="h-10 rounded-xl border border-white/15 px-4 text-sm font-bold text-white">
            {editing ? "Close" : "Edit"}
          </button>
        </div>
        <p className="mt-3 rounded-xl bg-white/[0.04] p-3 text-xs leading-5 text-white/50">
          Tip: put this link in your Konnect bio and your Instagram and WhatsApp status so buyers can find you.
        </p>
      </div>

      {editing && (
        <div className="mt-2">
          <ShopForm initial={shop} onSubmit={(f) => updateShop.mutate(f)} pending={updateShop.isPending} submitLabel="Save changes" />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between px-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Products ({shop.products.length})</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-black">
            <Plus size={16} /> Add product
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-3">
          <ProductForm defaultCategory={shop.category} onSubmit={(f) => addProduct.mutate(f)} onCancel={() => setAdding(false)} pending={addProduct.isPending} />
        </div>
      )}

      <div className="mt-3 divide-y divide-white/5">
        {shop.products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
              {p.images && p.images[0] ? <img src={getFullUrl(p.images[0])} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20"><Store size={22} /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{p.title}</p>
              <p className="text-sm font-black text-[var(--rc-teaky)]">{formatPrice(p.price)}</p>
              <button
                onClick={() => updateProduct.mutate({ id: p.id, data: { in_stock: !p.in_stock } })}
                className={"mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase " + (p.in_stock ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400")}
              >
                {p.in_stock ? "In stock" : "Sold out"}
              </button>
            </div>
            <button
              onClick={() => { if (window.confirm("Remove " + p.title + "?")) deleteProduct.mutate(p.id); }}
              className="p-2 text-white/35"
              aria-label="Remove product"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {shop.products.length === 0 && !adding && <p className="px-4 py-10 text-center text-sm text-white/40">No products yet. Add your first one.</p>}
      </div>
    </div>
  );
};
