import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
  image: String,
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, strict: 'throw' })

export const Certification = mongoose.model('Certification', schema)
