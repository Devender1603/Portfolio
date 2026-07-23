import express from 'express'
import morgan from 'morgan'
import { env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { security } from './middlewares/security.js'
import { apiRateLimit } from './middlewares/rateLimit.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { healthRouter } from './routes/healthRoutes.js'
import { portfolioRouter } from './routes/portfolioRoutes.js'
import { profileRouter } from './routes/profileRoutes.js'
import { contentRouter } from './routes/contentRoutes.js'
import { contactRouter } from './routes/contactRoutes.js'
import { assetRouter } from './routes/assetRoutes.js'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(...security)
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use('/api/v1', apiRateLimit)

app.use('/api/v1/health', healthRouter)
app.use('/api/v1/portfolio', portfolioRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1', contentRouter)
app.use('/api/v1/contact', contactRouter)
app.use('/api/v1/assets', assetRouter)

app.use(notFound)
app.use(errorHandler)

let server
if (process.env.NODE_ENV !== 'test') {
  connectDatabase().then(() => {
    server = app.listen(env.port, () => console.log(`API listening on port ${env.port}`))
  }).catch((error) => {
    console.error('Unable to start server', error)
    process.exitCode = 1
  })
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`)
  if (server) await new Promise((resolve) => server.close(resolve))
  await disconnectDatabase()
  process.exit(0)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export default app
