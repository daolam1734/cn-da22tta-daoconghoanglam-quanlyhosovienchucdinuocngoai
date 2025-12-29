const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.use(protect);

router.post('/', authorize('VIEN_CHUC'), upload.array('files', 5), recordController.createRecord);
router.put('/:id', authorize('VIEN_CHUC'), upload.array('files', 5), recordController.updateRecord);
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);
router.post('/:id/submit', authorize('VIEN_CHUC'), recordController.submitRecord);
router.post('/:id/withdraw', authorize('VIEN_CHUC'), recordController.withdrawRecord);
router.post('/:id/process', authorize('TRUONG_DON_VI', 'CHI_BO', 'DANG_UY', 'TCNS', 'BGH'), upload.array('files', 5), recordController.processRecord);

module.exports = router;
