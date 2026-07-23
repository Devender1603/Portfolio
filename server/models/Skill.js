import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  level: { type: Number, min: 0, max: 100 },
  icon: String,
  years: Number,
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Skill = mongoose.model('Skill', schema)
