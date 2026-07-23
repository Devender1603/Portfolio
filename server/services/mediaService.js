import sharp from 'sharp'
import { Asset } from '../models/Asset.js'
import { ApiError } from '../utils/apiError.js'

export async function optimizeAndStoreImage(file, alt = '') {
  if (!file) throw new ApiError(400, 'An image file is required', 'IMAGE_REQUIRED')
  const optimized = await sharp(file.buffer).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
  const metadata = await sharp(optimized.data).metadata()
  const asset = await Asset.create({
    filename: `${file.originalname.replace(/\.[^/.]+$/, '')}.webp`,
    contentType: 'image/webp',
    width: metadata.width,
    height: metadata.height,
    size: optimized.data.length,
    data: optimized.data,
    alt,
  })
  return { id: asset._id, url: `/api/v1/assets/${asset._id}`, width: asset.width, height: asset.height, size: asset.size, alt: asset.alt }
}

export async function getImage(id) {
  const asset = await Asset.findById(id).select('+data')
  if (!asset) throw new ApiError(404, 'Image not found', 'ASSET_NOT_FOUND')
  return asset
}
