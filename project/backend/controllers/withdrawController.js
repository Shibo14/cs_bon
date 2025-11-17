const withdrawService = require('../services/withdrawService');
const userService = require('../services/userService');

/**
 * Create a withdraw request
 */
exports.createWithdrawRequest = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { inventoryItemId } = req.body;

    if (!inventoryItemId) {
      return res.status(400).json({
        success: false,
        error: 'Inventory item ID is required'
      });
    }

    const withdrawRequest = await withdrawService.createWithdrawRequest(user._id, inventoryItemId);

    res.json({
      success: true,
      message: 'Withdraw request created successfully',
      data: withdrawRequest
    });
  } catch (error) {
    if (error.message.includes('Steam trade URL not set')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

/**
 * Get user's withdraw requests
 */
exports.getUserWithdrawRequests = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const requests = await withdrawService.getUserWithdrawRequests(user._id);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a withdraw request
 */
exports.cancelWithdrawRequest = async (req, res, next) => {
  try {
    const user = await userService.getOrCreateUser(req.telegramUser);
    const { requestId } = req.params;

    const request = await withdrawService.cancelWithdrawRequest(requestId, user._id);

    res.json({
      success: true,
      message: 'Withdraw request cancelled',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get withdraw statistics
 */
exports.getWithdrawStats = async (req, res, next) => {
  try {
    const stats = await withdrawService.getWithdrawStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
