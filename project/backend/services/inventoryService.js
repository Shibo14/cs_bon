const Inventory = require('../models/Inventory');
const User = require('../models/User');

class InventoryService {
  /**
   * Get user's inventory
   */
  async getUserInventory(userId, status = 'available') {
    const query = { userId };
    if (status) {
      query.status = status;
    }

    return await Inventory.find(query)
      .populate('skinId')
      .populate('caseId')
      .sort({ acquiredAt: -1 });
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItem(itemId) {
    return await Inventory.findById(itemId)
      .populate('skinId')
      .populate('userId');
  }

  /**
   * Get user's available items
   */
  async getUserAvailableItems(userId) {
    return await Inventory.getUserAvailableItems(userId);
  }

  /**
   * Get inventory statistics for user
   */
  async getInventoryStats(userId) {
    const total = await Inventory.countDocuments({ userId });
    const available = await Inventory.countDocuments({ userId, status: 'available' });
    const pendingWithdrawal = await Inventory.countDocuments({ userId, status: 'pending_withdrawal' });
    const withdrawn = await Inventory.countDocuments({ userId, status: 'withdrawn' });

    // Calculate total value
    const items = await Inventory.find({ userId, status: 'available' }).populate('skinId');
    const totalValue = items.reduce((sum, item) => sum + (item.skinId?.price || 0), 0);

    return {
      total,
      available,
      pendingWithdrawal,
      withdrawn,
      totalValue
    };
  }

  /**
   * Mark item as pending withdrawal
   */
  async markItemPendingWithdrawal(itemId, userId) {
    const item = await Inventory.findOne({ _id: itemId, userId });

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.status !== 'available') {
      throw new Error('Item is not available for withdrawal');
    }

    await item.markPendingWithdrawal();
    return item;
  }

  /**
   * Mark item as withdrawn
   */
  async markItemWithdrawn(itemId) {
    const item = await Inventory.findById(itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.markWithdrawn();
    return item;
  }

  /**
   * Mark item as failed and make available again
   */
  async markItemFailed(itemId) {
    const item = await Inventory.findById(itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.markFailed();
    // Reset to available
    item.status = 'available';
    await item.save();
    return item;
  }

  /**
   * Get recent wins (for display)
   */
  async getRecentWins(limit = 10) {
    return await Inventory.find({ acquiredFrom: 'case_opening' })
      .populate('skinId')
      .populate('userId', 'username firstName')
      .sort({ acquiredAt: -1 })
      .limit(limit);
  }
}

module.exports = new InventoryService();
