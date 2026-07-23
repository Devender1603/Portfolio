import { Router } from 'express'
import { getPortfolio } from '../controllers/portfolioController.js'

export const portfolioRouter = Router()
portfolioRouter.get('/', getPortfolio)
