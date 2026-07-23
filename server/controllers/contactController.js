import { createHash } from 'node:crypto'
import { ContactMessage } from '../models/ContactMessage.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createContact = asyncHandler(async (req, res) => {
  const ipHash = createHash('sha256').update(req.ip || 'unknown').digest('hex')
  const message = await ContactMessage.create({ ...req.body, ipHash, userAgent: req.get('user-agent') })
  res.status(201).json({ success: true, data: { id: message._id, status: message.status } })
})
export const listContacts = asyncHandler(async (req, res) => {
  const items = await ContactMessage.find().sort('-createdAt').limit(100).lean()
  res.json({ success: true, data: items })
})
export const updateContact = asyncHandler(async (req, res) => {
  const item = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean()
  if (!item) return res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Contact message not found' } })
  res.json({ success: true, data: item })
})
