const express = require('express');
const { body, param } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const c = require('../controllers/apiControllers');

const router = express.Router();

router.route('/')
  .get(protect, c.getProjects)
  .post(
    protect,
    adminOnly,
    [
      body('projectCode')
        .trim()
        .notEmpty()
        .withMessage('Project ID is required')
        .matches(/^[A-Za-z0-9][A-Za-z0-9-]{2,19}$/)
        .withMessage('Project ID must be 3-20 characters and use letters, numbers, or hyphens'),
      body('title').trim().notEmpty().withMessage('Project title is required'),
      body('description').optional().trim(),
      body('members').optional().isArray().withMessage('Members must be an array'),
      body('members.*').optional().isMongoId().withMessage('Member id is invalid'),
    ],
    validate,
    c.createProject
  );

router.put(
  '/:id/members',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Project id is invalid'),
    body('members').isArray({ min: 1 }).withMessage('Select at least one member'),
    body('members.*').isMongoId().withMessage('Member id is invalid'),
  ],
  validate,
  c.addProjectMembers
);

router.delete(
  '/:id/members/:userId',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Project id is invalid'),
    param('userId').isMongoId().withMessage('User id is invalid'),
  ],
  validate,
  c.removeProjectMember
);

module.exports = router;
