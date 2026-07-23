import { Router } from 'express'
import { createCrudController } from '../controllers/crudController.js'
import { createCrudService } from '../services/crudService.js'

export function createCrudRoutes(Model) {
  const router = Router()
  const controller = createCrudController(createCrudService(Model))
  router.route('/').get(controller.list).post(controller.create)
  router.route('/:id').get(controller.get).patch(controller.update).delete(controller.remove)
  return router
}
