const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { submitReport, getReportByRecord, approveReport, getPendingReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer config for report files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/reports';
        if (!require('fs').existsSync(dir)) {
            require('fs').mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `BC-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/', protect, upload.array('files'), submitReport);
router.get('/record/:ma_ho_so', protect, getReportByRecord);
router.get('/pending', protect, authorize('TCNS', 'CHI_BO'), getPendingReports);
router.put('/:id/approve', protect, authorize('TCNS', 'CHI_BO'), approveReport);

module.exports = router;
