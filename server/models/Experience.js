import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  summary: String,
  achievements: [String],
  technologies: [String],
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Experience = mongoose.model('Experience', schema)
