import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  field: String,
  startDate: Date,
  endDate: Date,
  grade: String,
  description: String,
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Education = mongoose.model('Education', schema)
