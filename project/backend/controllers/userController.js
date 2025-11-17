const userService = require('../services/userService');

/**
 * Get or create current user
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);

    res.json({
      success: true,
      data: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        crystals: user.crystals,
        steamTradeUrl: user.steamTradeUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Steam trade URL
 */
exports.updateSteamTradeUrl = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { steamTradeUrl } = req.body;

    if (!steamTradeUrl) {
      return res.status(400).json({
        success: false,
        error: 'Steam trade URL is required'
      });
    }

    const updatedUser = await userService.updateSteamTradeUrl(user._id, steamTradeUrl);

    res.json({
      success: true,
      message: 'Steam trade URL updated successfully',
      data: {
        steamTradeUrl: updatedUser.steamTradeUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const stats = await userService.getUserStats(user._id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add crystals (for testing/admin purposes)
 */
exports.addCrystals = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const updatedUser = await userService.addCrystals(user._id, amount);

    res.json({
      success: true,
      message: 'Crystals added successfully',
      data: {
        crystals: updatedUser.crystals
      }
    });
  } catch (error) {
    next(error);
  }
};
