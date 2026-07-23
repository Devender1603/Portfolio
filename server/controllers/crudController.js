import { asyncHandler } from '../utils/asyncHandler.js'

export function createCrudController(service) {
  return {
    list: asyncHandler(async (req, res) => {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100)
      const result = await service.list({ page, limit, query: req.query.published === 'false' ? {} : { published: true } })
      res.json({ success: true, data: result.items, meta: { page, limit, total: result.total, pages: result.pages } })
    }),
    get: asyncHandler(async (req, res) => res.json({ success: true, data: await service.getById(req.params.id) })),
    create: asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.create(req.body) })),
    update: asyncHandler(async (req, res) => res.json({ success: true, data: await service.update(req.params.id, req.body) })),
    remove: asyncHandler(async (req, res) => res.json({ success: true, data: await service.remove(req.params.id) })),
  }
}
