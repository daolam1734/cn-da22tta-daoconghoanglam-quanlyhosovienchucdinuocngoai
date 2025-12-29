const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, updateUserRoles } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getUsers);
router.post('/', protect, authorize('ADMIN'), createUser);
router.put('/:id', protect, authorize('ADMIN'), updateUser);
router.put('/:id/roles', protect, authorize('ADMIN'), updateUserRoles);

module.exports = router;
