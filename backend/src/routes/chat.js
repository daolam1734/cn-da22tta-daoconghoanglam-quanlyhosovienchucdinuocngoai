const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/message', protect, chatController.handleMessage);

module.exports = router;
