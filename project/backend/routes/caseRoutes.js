const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticateTelegram } = require('../middleware/auth');

// Public routes
router.get('/', caseController.getCases);
router.get('/:caseId', caseController.getCaseById);
router.get('/:caseId/contents', caseController.getCaseContents);

// Protected routes
router.post('/open', authenticateTelegram, caseController.openCase);

module.exports = router;
