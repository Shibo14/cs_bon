const inventoryService = require('../services/inventoryService');
const userService = require('../services/userService');

/**
 * Get user's inventory
 */
exports.getInventory = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { status } = req.query;

    const inventory = await inventoryService.getUserInventory(user._id, status);

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available inventory items
 */
exports.getAvailableItems = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const items = await inventoryService.getUserAvailableItems(user._id);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory statistics
 */
exports.getInventoryStats = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const stats = await inventoryService.getInventoryStats(user._id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent wins (public)
 */
exports.getRecentWins = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const recentWins = await inventoryService.getRecentWins(parseInt(limit) || 10);

    res.json({
      success: true,
      data: recentWins
    });
  } catch (error) {
    next(error);
  }
};
