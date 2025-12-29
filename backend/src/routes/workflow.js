const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', workflowController.getWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.post('/', workflowController.createWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
