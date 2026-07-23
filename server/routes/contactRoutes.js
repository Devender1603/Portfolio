import { Router } from 'express'
import { createContact, listContacts, updateContact } from '../controllers/contactController.js'
import { contactRateLimit } from '../middlewares/rateLimit.js'

export const contactRouter = Router()
contactRouter.post('/', contactRateLimit, createContact)
contactRouter.get('/', listContacts)
contactRouter.patch('/:id', updateContact)
