const express = require('express');
const router = express.Router();
const regulationController = require('../controllers/regulationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/', protect, regulationController.getAllRegulations);
router.post('/:id/download', protect, regulationController.incrementDownload);

// Admin only routes
router.post('/', protect, authorize('ADMIN'), upload.single('file'), regulationController.createRegulation);
router.put('/:id', protect, authorize('ADMIN'), upload.single('file'), regulationController.updateRegulation);
router.delete('/:id', protect, authorize('ADMIN'), regulationController.deleteRegulation);

module.exports = router;
