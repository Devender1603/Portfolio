import mongoose from 'mongoose'

export const contentFields = {
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  summary: { type: String, trim: true, maxlength: 500 },
  description: { type: String, trim: true },
  featured: { type: Boolean, default: false, index: true },
  order: { type: Number, default: 0, index: true },
  published: { type: Boolean, default: true, index: true },
  seo: {
    title: { type: String, trim: true, maxlength: 70 },
    description: { type: String, trim: true, maxlength: 160 },
    image: String,
  },
}

export function createContentSchema(extra = {}) {
  return new mongoose.Schema({ ...contentFields, ...extra }, { timestamps: true, strict: 'throw' })
}
