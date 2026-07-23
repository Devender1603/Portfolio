import { ApiError } from '../utils/apiError.js'

export function createCrudService(Model) {
  return {
    async list({ query = {}, page = 1, limit = 12, sort = '-order -createdAt' } = {}) {
      const [items, total] = await Promise.all([
        Model.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        Model.countDocuments(query),
      ])
      return { items, total, page, limit, pages: Math.ceil(total / limit) }
    },
    async getById(id) {
      const item = await Model.findById(id).lean()
      if (!item) throw new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND')
      return item
    },
    async create(data) { return Model.create(data) },
    async update(id, data) {
      const item = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
      if (!item) throw new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND')
      return item
    },
    async remove(id) {
      const item = await Model.findByIdAndDelete(id).lean()
      if (!item) throw new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND')
      return item
    },
  }
}
