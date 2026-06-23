const { body, validationResult } = require('express-validator')

const validateRegister = [
  body('username')
    .exists({ checkFalsy: true })
    .withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters'),
  
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('passwordConfirm')
    .exists({ checkFalsy: true })
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

const validatePost = [
  body('content')
    .isString()
    .withMessage('Content is required')
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),

  (req, res, next) => {
    const errors = validationResult(req)
    console.log('req.body:', req.body) // Debug log to check incoming data
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]

module.exports = { validateRegister, validatePost }

