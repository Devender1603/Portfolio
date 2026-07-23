import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { env } from '../config/env.js'

export const security = [
  helmet(),
  cors({ origin: env.clientOrigin, credentials: true }),
  compression(),
]
