const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skin',
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'pending_withdrawal', 'withdrawn', 'failed'],
    default: 'available',
    index: true
  },
  acquiredFrom: {
    type: String,
    enum: ['case_opening', 'bonus', 'refund'],
    default: 'case_opening'
  },
  acquiredAt: {
    type: Date,
    default: Date.now
  },
  withdrawnAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
inventorySchema.index({ userId: 1, status: 1 });
inventorySchema.index({ userId: 1, acquiredAt: -1 });

// Get user's available items
inventorySchema.statics.getUserAvailableItems = function(userId) {
  return this.find({ userId, status: 'available' })
    .populate('skinId')
    .sort({ acquiredAt: -1 });
};

// Mark item as pending withdrawal
inventorySchema.methods.markPendingWithdrawal = function() {
  this.status = 'pending_withdrawal';
  return this.save();
};

// Mark item as withdrawn
inventorySchema.methods.markWithdrawn = function() {
  this.status = 'withdrawn';
  this.withdrawnAt = new Date();
  return this.save();
};

// Mark item as failed
inventorySchema.methods.markFailed = function() {
  this.status = 'failed';
  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
