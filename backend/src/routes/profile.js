const express = require('express');
const router = express.Router();
const { getProfile, getProfileMetadata, updateProfile, updateAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/', protect, getProfile);
router.get('/metadata', protect, getProfileMetadata);
router.put('/', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
