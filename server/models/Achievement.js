import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  organization: String,
  date: Date,
  description: String,
  url: String,
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Achievement = mongoose.model('Achievement', schema)
