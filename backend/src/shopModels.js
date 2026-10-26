import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const { Schema, model, models } = mongoose;
const makeId = () => nanoid(12);
const baseOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
};

const shopSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    owner_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '', maxlength: 500 },
    category: { type: String, default: 'Other' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    institution_id: { type: String, default: null, index: true },
    is_active: { type: Boolean, default: true },
  },
  baseOptions,
);

const productSchema = new Schema(
  {
    id: { type: String, unique: true, default: makeId, index: true },
    shop_id: { type: String, required: true, index: true },
    owner_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, default: 'Other' },
    in_stock: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Shop = models.Shop || model('Shop', shopSchema);
export const Product = models.Product || model('Product', productSchema);
