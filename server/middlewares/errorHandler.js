import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'))
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500)
  const payload = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status === 500 && env.nodeEnv === 'production' ? 'Internal server error' : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  }

  if (error.name === 'ValidationError') {
    payload.error.code = 'VALIDATION_ERROR'
    payload.error.details = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
  }
  if (error.code === 11000) {
    payload.error.code = 'DUPLICATE_RESOURCE'
    payload.error.message = 'A resource with this value already exists'
  }
  if (env.nodeEnv !== 'test') console.error(error)
  res.status(status).json(payload)
}
