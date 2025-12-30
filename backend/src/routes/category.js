const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

// Trip Types
router.get('/trip-types', categoryController.getTripTypes);
router.post('/trip-types', categoryController.createTripType);
router.put('/trip-types/:id', categoryController.updateTripType);
router.delete('/trip-types/:id', categoryController.deleteTripType);

// Countries
router.get('/countries', categoryController.getCountries);
router.post('/countries', categoryController.createCountry);
router.put('/countries/:id', categoryController.updateCountry);
router.delete('/countries/:id', categoryController.deleteCountry);

// Document Types
router.get('/document-types', categoryController.getDocumentTypes);
router.post('/document-types', categoryController.createDocumentType);
router.put('/document-types/:id', categoryController.updateDocumentType);
router.delete('/document-types/:id', categoryController.deleteDocumentType);

module.exports = router;
