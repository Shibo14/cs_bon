const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateTelegram } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateTelegram);

// Get current user
router.get('/me', userController.getCurrentUser);

// Update Steam trade URL
router.post('/steam-trade-url', userController.updateSteamTradeUrl);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Add crystals (for testing)
router.post('/crystals/add', userController.addCrystals);

module.exports = router;
