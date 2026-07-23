import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  quote: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  role: String,
  company: String,
  avatar: String,
  featured: { type: Boolean, default: false, index: true },
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Testimonial = mongoose.model('Testimonial', schema)
