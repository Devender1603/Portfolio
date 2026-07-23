import { z } from 'zod'

const text = z.string().trim().min(1)
export const contentValidator = z.object({ body: z.record(z.string(), z.unknown()), params: z.record(z.string(), z.string()), query: z.record(z.string(), z.string()) })
export const contactValidator = z.object({ body: z.object({ name: text.max(120), email: z.email(), subject: text.max(180), message: text.max(5000) }), params: z.record(z.string(), z.string()), query: z.record(z.string(), z.string()) })
