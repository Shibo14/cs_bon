const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateTelegram } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateTelegram);

// Payment methods
router.post('/uzcard', paymentController.payWithUzCard);
router.post('/click', paymentController.payWithClick);
router.post('/stars', paymentController.payWithStars);

// Payment callback (no auth required - called by payment provider)
router.post('/callback', paymentController.paymentCallback);

module.exports = router;
