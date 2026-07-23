import multer from 'multer'
import { env } from '../config/env.js'

const storage = multer.memoryStorage()
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export const imageUpload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowed.has(file.mimetype)),
}).single('image')
