import { Router } from 'express'
import { deleteProfile, getProfile, upsertProfile } from '../controllers/profileController.js'

export const profileRouter = Router()
profileRouter.route('/').get(getProfile).put(upsertProfile).delete(deleteProfile)
