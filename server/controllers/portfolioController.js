import { getPublicPortfolio } from '../services/portfolioService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getPortfolio = asyncHandler(async (_req, res) => res.json({ success: true, data: await getPublicPortfolio() }))
