export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    return next(new Error(JSON.stringify(details), { cause: 'VALIDATION_ERROR' }))
  }
  req.validated = result.data
  next()
}
