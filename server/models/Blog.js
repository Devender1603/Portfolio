import mongoose from 'mongoose'
import { createContentSchema } from './contentSchema.js'

export const Blog = mongoose.model('Blog', createContentSchema({
  excerpt: { type: String, maxlength: 500 },
  content: { type: String, required: true },
  coverImage: String,
  tags: [String],
  publishedAt: Date,
  readingTime: Number,
}))
