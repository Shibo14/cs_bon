const WithdrawRequest = require('../models/WithdrawRequest');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

class WithdrawService {
  /**
   * Create a withdraw request
   */
  async createWithdrawRequest(userId, inventoryItemId) {
    try {
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has Steam trade URL
      if (!user.steamTradeUrl) {
        throw new Error('Steam trade URL not set. Please set your trade URL first.');
      }

      // Get inventory item
      const inventoryItem = await Inventory.findOne({
        _id: inventoryItemId,
        userId: userId
      }).populate('skinId');

      if (!inventoryItem) {
        throw new Error('Item not found in inventory');
      }

      if (inventoryItem.status !== 'available') {
        throw new Error('Item is not available for withdrawal');
      }

      // Mark item as pending withdrawal
      await inventoryItem.markPendingWithdrawal();

      // Create withdraw request
      const withdrawRequest = await WithdrawRequest.create({
        userId: user._id,
        inventoryItemId: inventoryItem._id,
        skinId: inventoryItem.skinId._id,
        steamTradeUrl: user.steamTradeUrl,
        status: 'pending'
      });

      await withdrawRequest.populate(['userId', 'skinId', 'inventoryItemId']);

      console.log(`✅ Withdraw request created: ${withdrawRequest._id}`);

      return withdrawRequest;
    } catch (error) {
      console.error('Error creating withdraw request:', error);
      throw error;
    }
  }

  /**
   * Get pending withdraw requests
   */
  async getPendingRequests() {
    return await WithdrawRequest.getPendingRequests();
  }

  /**
   * Get processing withdraw requests
   */
  async getProcessingRequests() {
    return await WithdrawRequest.getProcessingRequests();
  }

  /**
   * Get user's withdraw requests
   */
  async getUserWithdrawRequests(userId) {
    return await WithdrawRequest.find({ userId })
      .populate('skinId')
      .populate('inventoryItemId')
      .sort({ requestedAt: -1 });
  }

  /**
   * Get withdraw request by ID
   */
  async getWithdrawRequestById(requestId) {
    return await WithdrawRequest.findById(requestId)
      .populate(['userId', 'skinId', 'inventoryItemId']);
  }

  /**
   * Update withdraw request status
   */
  async updateRequestStatus(requestId, status, data = {}) {
    const request = await WithdrawRequest.findById(requestId);

    if (!request) {
      throw new Error('Withdraw request not found');
    }

    request.status = status;

    if (data.tradeOfferId) {
      request.tradeOfferId = data.tradeOfferId;
    }

    if (data.tradeOfferState !== undefined) {
      request.tradeOfferState = data.tradeOfferState;
    }

    if (data.errorMessage) {
      request.errorMessage = data.errorMessage;
    }

    if (data.tradeHoldDuration !== undefined) {
      request.tradeHoldDuration = data.tradeHoldDuration;
    }

    if (status === 'processing') {
      request.processedAt = new Date();
    }

    if (['accepted', 'declined', 'failed', 'cancelled'].includes(status)) {
      request.completedAt = new Date();
    }

    await request.save();
    return request;
  }

  /**
   * Cancel withdraw request
   */
  async cancelWithdrawRequest(requestId, userId) {
    const request = await WithdrawRequest.findOne({ _id: requestId, userId });

    if (!request) {
      throw new Error('Withdraw request not found');
    }

    if (!['pending', 'processing'].includes(request.status)) {
      throw new Error('Cannot cancel request in current status');
    }

    // Mark request as cancelled
    request.status = 'cancelled';
    request.completedAt = new Date();
    await request.save();

    // Mark inventory item as available again
    const inventoryItem = await Inventory.findById(request.inventoryItemId);
    if (inventoryItem) {
      inventoryItem.status = 'available';
      await inventoryItem.save();
    }

    return request;
  }

  /**
   * Get withdraw statistics
   */
  async getWithdrawStats() {
    const pending = await WithdrawRequest.countDocuments({ status: 'pending' });
    const processing = await WithdrawRequest.countDocuments({ status: 'processing' });
    const sent = await WithdrawRequest.countDocuments({ status: 'sent' });
    const accepted = await WithdrawRequest.countDocuments({ status: 'accepted' });
    const failed = await WithdrawRequest.countDocuments({ status: 'failed' });

    return {
      pending,
      processing,
      sent,
      accepted,
      failed,
      total: pending + processing + sent + accepted + failed
    };
  }
}

module.exports = new WithdrawService();
