import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new', index: true },
  ipHash: String,
  userAgent: String,
  processedAt: Date,
}, { timestamps: true, strict: 'throw' })

export const ContactMessage = mongoose.model('ContactMessage', schema)
