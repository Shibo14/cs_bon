const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const { authenticateTelegram } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateTelegram);

// Create withdraw request
router.post('/', withdrawController.createWithdrawRequest);

// Get user's withdraw requests
router.get('/', withdrawController.getUserWithdrawRequests);

// Cancel withdraw request
router.post('/:requestId/cancel', withdrawController.cancelWithdrawRequest);

// Get withdraw statistics
router.get('/stats', withdrawController.getWithdrawStats);

module.exports = router;
