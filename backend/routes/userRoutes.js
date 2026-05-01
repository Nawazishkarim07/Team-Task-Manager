const express = require('express');
const { query } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const c = require('../controllers/apiControllers');

const router = express.Router();

router.get(
  '/',
  protect,
  adminOnly,
  [query('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member')],
  validate,
  c.getUsers
);

module.exports = router;
