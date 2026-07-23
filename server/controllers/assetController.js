import { asyncHandler } from '../utils/asyncHandler.js'
import { getImage, optimizeAndStoreImage } from '../services/mediaService.js'

export const uploadImage = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await optimizeAndStoreImage(req.file, req.body.alt) }))
export const serveImage = asyncHandler(async (req, res) => {
  const asset = await getImage(req.params.id)
  res.set({ 'Content-Type': asset.contentType, 'Content-Length': asset.data.length, 'Cache-Control': 'public, max-age=31536000, immutable' })
  res.send(asset.data)
})
