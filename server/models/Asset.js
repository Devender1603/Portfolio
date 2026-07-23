import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  width: Number,
  height: Number,
  size: { type: Number, required: true, max: 5 * 1024 * 1024 },
  data: { type: Buffer, required: true, select: false },
  alt: { type: String, trim: true, maxlength: 160 },
}, { timestamps: true, strict: 'throw' })

export const Asset = mongoose.model('Asset', schema)
