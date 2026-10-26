import { Router } from 'express';
import { User } from '../models.js';
import { Shop, Product } from '../shopModels.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError, notFound } from '../utils/httpError.js';

export const shopsRouter = Router();

const MAX_PRODUCTS = 100;
const MAX_IMAGES = 6;

const clean = (value, max) => String(value === undefined || value === null ? '' : value).trim().slice(0, max);

const slugify = (name) => {
  let out = '';
  for (const ch of String(name).toLowerCase()) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')) out += ch;
    else if (out.length && out[out.length - 1] !== '-') out += '-';
  }
  while (out.endsWith('-')) out = out.slice(0, -1);
  return out.slice(0, 40);
};

const uniqueSlug = async (name) => {
  const base = slugify(name) || 'shop';
  let slug = base;
  let n = 2;
  while (await Shop.exists({ slug })) {
    slug = base + '-' + n;
    n += 1;
  }
  return slug;
};

// Keeps digits only. Nigerian numbers starting with 0 become 234... so wa.me links work.
const normalizePhone = (value) => {
  const raw = clean(value, 25);
  if (!raw) return '';
  let digits = '';
  for (const ch of raw) if (ch >= '0' && ch <= '9') digits += ch;
  if (digits.startsWith('0') && digits.length === 11) digits = '234' + digits.slice(1);
  if (digits.length < 10 || digits.length > 15) throw new HttpError(400, 'Enter a valid WhatsApp number, for example 08012345678.');
  return digits;
};

const escapeRegex = (text) => {
  let out = '';
  for (const ch of text) out += '.*+?^$(){}|[]\\'.includes(ch) ? '\\' + ch : ch;
  return out;
};

const cleanImages = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((u) => clean(u, 500)).filter(Boolean).slice(0, MAX_IMAGES);
};

const parsePrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 1000000000) throw new HttpError(400, 'Enter a valid price.');
  return Math.round(price * 100) / 100;
};

const ownerOf = async (ownerId) => {
  const user = await User.findOne({ id: ownerId });
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    full_name: user.profile?.full_name || user.username,
    avatar: user.profile?.profile_picture || '',
  };
};

const shopOut = (shop) => {
  const s = shop.toObject ? shop.toObject() : shop;
  delete s._id;
  return s;
};

const productOut = (product) => {
  const p = product.toObject ? product.toObject() : product;
  delete p._id;
  return p;
};

const requireMyShop = async (req) => {
  const shop = await Shop.findOne({ owner_id: req.user.id });
  if (!shop) throw new HttpError(404, 'Open your shop first.');
  return shop;
};

const readShopFields = (body, existing) => {
  const out = {};
  if (body.name !== undefined || !existing) {
    const name = clean(body.name, 40);
    if (name.length < 2) throw new HttpError(400, 'Shop name must be at least 2 characters.');
    out.name = name;
  }
  if (body.description !== undefined) out.description = clean(body.description, 500);
  if (body.category !== undefined) out.category = clean(body.category, 30) || 'Other';
  if (body.logo !== undefined) out.logo = clean(body.logo, 500);
  if (body.banner !== undefined) out.banner = clean(body.banner, 500);
  if (body.whatsapp !== undefined) out.whatsapp = normalizePhone(body.whatsapp);
  return out;
};

// Browse and search shops (public). ?q=word&category=Food&institution_id=...&limit=20&skip=0
shopsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 40);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const query = { is_active: true };
    if (req.query.category) query.category = clean(req.query.category, 30);
    if (req.query.institution_id) query.institution_id = clean(req.query.institution_id, 80);
    const q = clean(req.query.q, 60);
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      const matchingProducts = await Product.find({ title: rx }).select('shop_id').limit(200).lean();
      const shopIds = [...new Set(matchingProducts.map((p) => p.shop_id))];
      query.$or = [{ name: rx }, { description: rx }, { category: rx }, { id: { $in: shopIds } }];
    }
    const shops = await Shop.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);
    const ids = shops.map((s) => s.id);
    const products = ids.length
      ? await Product.find({ shop_id: { $in: ids } }).sort({ created_at: -1 }).select('shop_id images in_stock').lean()
      : [];
    const byShop = new Map();
    for (const p of products) {
      if (!byShop.has(p.shop_id)) byShop.set(p.shop_id, { count: 0, previews: [] });
      const entry = byShop.get(p.shop_id);
      entry.count += 1;
      if (entry.previews.length < 3 && p.images && p.images[0]) entry.previews.push(p.images[0]);
    }
    res.json(
      shops.map((shop) => ({
        ...shopOut(shop),
        product_count: byShop.get(shop.id)?.count || 0,
        previews: byShop.get(shop.id)?.previews || [],
      })),
    );
  }),
);

// My shop (or null if I have not opened one).
shopsRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ owner_id: req.user.id });
    if (!shop) return res.json(null);
    const products = await Product.find({ shop_id: shop.id }).sort({ created_at: -1 });
    res.json({ ...shopOut(shop), products: products.map(productOut) });
  }),
);

// Open a shop. One per person.
shopsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (await Shop.exists({ owner_id: req.user.id })) throw new HttpError(409, 'You already have a shop.');
    const fields = readShopFields(req.body || {}, null);
    const slug = await uniqueSlug(fields.name);
    const shop = await Shop.create({ ...fields, slug, owner_id: req.user.id, institution_id: req.user.institution_id || null });
    res.status(201).json({ ...shopOut(shop), products: [] });
  }),
);

// Edit my shop. The link (slug) never changes, so links already shared keep working.
shopsRouter.patch(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const shop = await requireMyShop(req);
    Object.assign(shop, readShopFields(req.body || {}, shop));
    await shop.save();
    res.json(shopOut(shop));
  }),
);

shopsRouter.post(
  '/mine/products',
  requireAuth,
  asyncHandler(async (req, res) => {
    const shop = await requireMyShop(req);
    if ((await Product.countDocuments({ shop_id: shop.id })) >= MAX_PRODUCTS) throw new HttpError(400, 'You have reached the limit of ' + MAX_PRODUCTS + ' products.');
    const title = clean(req.body.title, 80);
    if (title.length < 2) throw new HttpError(400, 'Give your product a name.');
    const product = await Product.create({
      shop_id: shop.id,
      owner_id: req.user.id,
      title,
      description: clean(req.body.description, 1000),
      price: parsePrice(req.body.price),
      images: cleanImages(req.body.images),
      category: clean(req.body.category, 30) || shop.category,
      in_stock: req.body.in_stock === undefined ? true : Boolean(req.body.in_stock),
    });
    res.status(201).json(productOut(product));
  }),
);

shopsRouter.patch(
  '/mine/products/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const shop = await requireMyShop(req);
    const product = await Product.findOne({ id: req.params.productId, shop_id: shop.id });
    if (!product) throw notFound('Product not found.');
    const b = req.body || {};
    if (b.title !== undefined) {
      const title = clean(b.title, 80);
      if (title.length < 2) throw new HttpError(400, 'Give your product a name.');
      product.title = title;
    }
    if (b.description !== undefined) product.description = clean(b.description, 1000);
    if (b.price !== undefined) product.price = parsePrice(b.price);
    if (b.images !== undefined) product.images = cleanImages(b.images);
    if (b.category !== undefined) product.category = clean(b.category, 30) || 'Other';
    if (b.in_stock !== undefined) product.in_stock = Boolean(b.in_stock);
    await product.save();
    res.json(productOut(product));
  }),
);

shopsRouter.delete(
  '/mine/products/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const shop = await requireMyShop(req);
    const result = await Product.deleteOne({ id: req.params.productId, shop_id: shop.id });
    if (!result.deletedCount) throw notFound('Product not found.');
    res.json({ status: 'deleted' });
  }),
);

// Used by profiles to show a "Visit shop" button (public).
shopsRouter.get(
  '/by-owner/:username',
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: new RegExp('^' + escapeRegex(clean(req.params.username, 60)) + '$', 'i') });
    if (!user) return res.json(null);
    const shop = await Shop.findOne({ owner_id: user.id, is_active: true });
    res.json(shop ? { slug: shop.slug, name: shop.name, logo: shop.logo } : null);
  }),
);

// A public shop page. Anyone with the link can open it.
shopsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ slug: clean(req.params.slug, 60).toLowerCase(), is_active: true });
    if (!shop) throw notFound('Shop not found.');
    const [owner, products] = await Promise.all([
      ownerOf(shop.owner_id),
      Product.find({ shop_id: shop.id }).sort({ in_stock: -1, created_at: -1 }),
    ]);
    res.json({ ...shopOut(shop), owner, products: products.map(productOut) });
  }),
);
