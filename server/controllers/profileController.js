import { Profile } from '../models/Profile.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'

export const getProfile = asyncHandler(async (_req, res) => res.json({ success: true, data: await Profile.findOne({ key: 'primary' }).lean() }))
export const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate({ key: 'primary' }, { ...req.body, key: 'primary' }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }).lean()
  res.json({ success: true, data: profile })
})
export const deleteProfile = asyncHandler(async (_req, _res, next) => next(new ApiError(405, 'The primary profile cannot be deleted', 'PROFILE_DELETE_FORBIDDEN')))
