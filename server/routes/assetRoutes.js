import { Router } from 'express'
import { uploadImage, serveImage } from '../controllers/assetController.js'
import { imageUpload } from '../middlewares/upload.js'

export const assetRouter = Router()
assetRouter.post('/', imageUpload, uploadImage)
assetRouter.get('/:id', serveImage)
