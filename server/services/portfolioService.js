import { Profile, Project, Experience, Education, Skill, Certification, Achievement, Blog, Testimonial, Service } from '../models/index.js'

export async function getPublicPortfolio() {
  const [profile, projects, experience, education, skills, certifications, achievements, blogs, testimonials, services] = await Promise.all([
    Profile.findOne({ key: 'primary' }).lean(),
    Project.find({ published: true }).sort('-featured -order -year').limit(6).lean(),
    Experience.find().sort('order -startDate').lean(),
    Education.find().sort('order -endDate').lean(),
    Skill.find().sort('category order').lean(),
    Certification.find().sort('order -issueDate').lean(),
    Achievement.find().sort('order -date').lean(),
    Blog.find({ published: true }).sort('-publishedAt').limit(6).lean(),
    Testimonial.find().sort('-featured order').lean(),
    Service.find({ published: true }).sort('order').lean(),
  ])
  return { profile, projects, experience, education, skills, certifications, achievements, blogs, testimonials, services }
}
