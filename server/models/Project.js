import mongoose from 'mongoose'
import { createContentSchema } from './contentSchema.js'

export const Project = mongoose.model('Project', createContentSchema({
  role: String,
  year: Number,
  status: { type: String, enum: ['completed', 'active', 'archived'], default: 'completed' },
  coverImage: String,
  gallery: [{ url: String, alt: String, width: Number, height: Number }],
  technologies: [{ type: String, trim: true }],
  liveUrl: String,
  repoUrl: String,
  metrics: [{ label: String, value: String }],
}))
