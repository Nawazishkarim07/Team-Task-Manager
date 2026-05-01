const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/apiControllers');

const router = express.Router();

router.get('/', protect, c.getDashboardStats);

module.exports = router;
