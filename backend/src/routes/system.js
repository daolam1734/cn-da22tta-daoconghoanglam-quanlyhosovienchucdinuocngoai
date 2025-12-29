const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', systemController.getConfigs);
router.put('/', systemController.updateConfig);

module.exports = router;
