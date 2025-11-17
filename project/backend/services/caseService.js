const Case = require('../models/Case');
const Skin = require('../models/Skin');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

class CaseService {
  /**
   * Get all active cases
   */
  async getActiveCases() {
    return await Case.find({ active: true })
      .populate('contents.skinId')
      .sort({ price: 1 });
  }

  /**
   * Get case by ID
   */
  async getCaseById(caseId) {
    const caseData = await Case.findById(caseId).populate('contents.skinId');
    if (!caseData) {
      throw new Error('Case not found');
    }
    return caseData;
  }

  /**
   * Open a case
   */
  async openCase(userId, caseId) {
    try {
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get case
      const caseData = await Case.findById(caseId).populate('contents.skinId');
      if (!caseData) {
        throw new Error('Case not found');
      }

      if (!caseData.active) {
        throw new Error('Case is not active');
      }

      // Check if user has enough crystals
      const cost = caseData.price;
      if (user.crystals < cost) {
        throw new Error('Insufficient crystals');
      }

      // Deduct crystals
      await user.deductCrystals(cost);

      // Get random skin
      const wonSkinId = caseData.getRandomSkin();
      const wonSkin = await Skin.findById(wonSkinId);

      if (!wonSkin) {
        // Refund crystals if skin not found
        await user.addCrystals(cost);
        throw new Error('Won skin not found');
      }

      // Add to inventory
      const inventoryItem = await Inventory.create({
        userId: user._id,
        skinId: wonSkin._id,
        caseId: caseData._id,
        acquiredFrom: 'case_opening'
      });

      // Update case statistics
      caseData.totalOpened += 1;
      await caseData.save();

      // Populate the inventory item
      await inventoryItem.populate('skinId');

      return {
        success: true,
        wonSkin: wonSkin,
        inventoryItem: inventoryItem,
        remainingCrystals: user.crystals
      };
    } catch (error) {
      console.error('Error opening case:', error);
      throw error;
    }
  }

  /**
   * Create a new case
   */
  async createCase(caseData) {
    // Validate probabilities sum to 100
    const totalProbability = caseData.contents.reduce((sum, item) => sum + item.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {
      throw new Error('Case probabilities must sum to 100');
    }

    const newCase = await Case.create(caseData);
    return newCase;
  }

  /**
   * Update case
   */
  async updateCase(caseId, updateData) {
    const caseData = await Case.findByIdAndUpdate(caseId, updateData, { new: true });
    if (!caseData) {
      throw new Error('Case not found');
    }
    return caseData;
  }

  /**
   * Get case contents with details
   */
  async getCaseContents(caseId) {
    const caseData = await Case.findById(caseId).populate('contents.skinId');
    if (!caseData) {
      throw new Error('Case not found');
    }

    return caseData.contents.map(item => ({
      skin: item.skinId,
      probability: item.probability
    }));
  }
}

module.exports = new CaseService();
