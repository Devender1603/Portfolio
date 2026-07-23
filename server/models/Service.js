import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  description: String,
  icon: String,
  features: [String],
  startingPrice: String,
  order: { type: Number, default: 0, index: true },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true, strict: 'throw' })

export const Service = mongoose.model('Service', schema)
