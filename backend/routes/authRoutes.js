const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const c = require('../controllers/apiControllers');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
  ],
  validate,
  c.registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  c.loginUser
);

module.exports = router;
