const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateTelegram, optionalAuth } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateTelegram);

// Get user's inventory
router.get('/', inventoryController.getInventory);

// Get available items
router.get('/available', inventoryController.getAvailableItems);

// Get inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Public route for recent wins
router.get('/recent-wins', optionalAuth, inventoryController.getRecentWins);

module.exports = router;
