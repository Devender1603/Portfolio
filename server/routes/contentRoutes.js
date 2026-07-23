import { Router } from 'express'
import { Achievement, Blog, Certification, Education, Experience, Project, Service, Skill, Testimonial } from '../models/index.js'
import { createCrudRoutes } from './crudRoutes.js'

export const contentRouter = Router()
contentRouter.use('/projects', createCrudRoutes(Project))
contentRouter.use('/experience', createCrudRoutes(Experience))
contentRouter.use('/education', createCrudRoutes(Education))
contentRouter.use('/skills', createCrudRoutes(Skill))
contentRouter.use('/certifications', createCrudRoutes(Certification))
contentRouter.use('/achievements', createCrudRoutes(Achievement))
contentRouter.use('/blogs', createCrudRoutes(Blog))
contentRouter.use('/testimonials', createCrudRoutes(Testimonial))
contentRouter.use('/services', createCrudRoutes(Service))
