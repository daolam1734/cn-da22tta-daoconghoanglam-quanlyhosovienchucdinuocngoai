const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getRoles);
router.post('/', protect, authorize('ADMIN'), createRole);
router.put('/:id', protect, authorize('ADMIN'), updateRole);
router.delete('/:id', protect, authorize('ADMIN'), deleteRole);

module.exports = router;
