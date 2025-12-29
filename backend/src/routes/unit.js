const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

// Don Vi
router.get('/', unitController.getUnits);
router.post('/', unitController.createUnit);
router.put('/:id', unitController.updateUnit);

// Don Vi Dang
router.get('/party', unitController.getPartyUnits);
router.post('/party', unitController.createPartyUnit);
router.put('/party/:id', unitController.updatePartyUnit);

module.exports = router;
