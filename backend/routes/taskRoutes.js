const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const c = require('../controllers/apiControllers');

const router = express.Router();

router.route('/')
  .get(
    protect,
    [query('projectId').optional().isMongoId().withMessage('Project id is invalid')],
    validate,
    c.getTasks
  )
  .post(
    protect,
    adminOnly,
    [
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('description').optional().trim(),
      body('assignedTo').isMongoId().withMessage('Assignee is required'),
      body('projectId').isMongoId().withMessage('Project is required'),
      body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
      body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Status is invalid'),
    ],
    validate,
    c.createTask
  );

router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Task id is invalid'),
    body('status').isIn(['To Do', 'In Progress', 'Done']).withMessage('Status is invalid'),
  ],
  validate,
  c.updateTaskStatus
);

module.exports = router;
