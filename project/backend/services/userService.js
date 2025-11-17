const User = require('../models/User');

class UserService {
  /**
   * Get or create user from Telegram data
   */
  async getOrCreateUser(telegramUser) {
    try {
      let user = await User.findOne({ telegramId: telegramUser.id });

      if (!user) {
        user = await User.create({
          telegramId: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.firstName,
          lastName: telegramUser.lastName,
          crystals: parseInt(process.env.DEFAULT_CRYSTALS) || 100
        });
        console.log(`✅ New user created: ${user.telegramId}`);
      } else {
        // Update last login
        await user.updateLastLogin();
      }

      return user;
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return await User.findById(userId);
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    return await User.findOne({ telegramId });
  }

  /**
   * Update user's Steam trade URL
   */
  async updateSteamTradeUrl(userId, tradeUrl) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Basic validation of trade URL
    if (!tradeUrl.includes('steamcommunity.com/tradeoffer/new/')) {
      throw new Error('Invalid Steam trade URL');
    }

    user.steamTradeUrl = tradeUrl;
    await user.save();

    return user;
  }

  /**
   * Add crystals to user
   */
  async addCrystals(userId, amount) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.addCrystals(amount);
    return user;
  }

  /**
   * Deduct crystals from user
   */
  async deductCrystals(userId, amount) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.deductCrystals(amount);
    return user;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const Inventory = require('../models/Inventory');
    const WithdrawRequest = require('../models/WithdrawRequest');

    const totalItems = await Inventory.countDocuments({ userId });
    const availableItems = await Inventory.countDocuments({ userId, status: 'available' });
    const pendingWithdrawals = await WithdrawRequest.countDocuments({ userId, status: { $in: ['pending', 'processing', 'sent'] } });

    return {
      user: {
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        crystals: user.crystals,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        steamTradeUrl: user.steamTradeUrl,
        createdAt: user.createdAt
      },
      stats: {
        totalItems,
        availableItems,
        pendingWithdrawals
      }
    };
  }
}

module.exports = new UserService();
