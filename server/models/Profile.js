import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true, immutable: true },
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  bio: { type: String, required: true, trim: true },
  location: String,
  avatar: String,
  resumeUrl: String,
  availability: { type: String, trim: true },
  socialLinks: [{ label: String, url: String }],
  seo: { title: String, description: String, image: String },
}, { timestamps: true, strict: 'throw' })

export const Profile = mongoose.model('Profile', profileSchema)
