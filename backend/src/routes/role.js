const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getRoles);
router.post('/', protect, authorize('ADMIN'), createRole);

module.exports = router;
