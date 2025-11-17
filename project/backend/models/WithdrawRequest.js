const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  skinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skin',
    required: true
  },
  steamTradeUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'accepted', 'declined', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  tradeOfferId: {
    type: String,
    default: null
  },
  tradeOfferState: {
    type: Number,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  tradeHoldDuration: {
    type: Number,
    default: 0
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
withdrawRequestSchema.index({ userId: 1, status: 1 });
withdrawRequestSchema.index({ status: 1, requestedAt: 1 });
withdrawRequestSchema.index({ tradeOfferId: 1 });

// Get pending requests
withdrawRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('userId')
    .populate('skinId')
    .sort({ requestedAt: 1 });
};

// Get processing requests
withdrawRequestSchema.statics.getProcessingRequests = function() {
  return this.find({ status: 'processing' })
    .populate('userId')
    .populate('skinId')
    .sort({ processedAt: 1 });
};

// Mark as processing
withdrawRequestSchema.methods.markProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  this.attempts += 1;
  return this.save();
};

// Mark as sent
withdrawRequestSchema.methods.markSent = function(tradeOfferId, tradeHoldDuration = 0) {
  this.status = 'sent';
  this.tradeOfferId = tradeOfferId;
  this.tradeHoldDuration = tradeHoldDuration;
  return this.save();
};

// Mark as accepted
withdrawRequestSchema.methods.markAccepted = function() {
  this.status = 'accepted';
  this.completedAt = new Date();
  return this.save();
};

// Mark as declined
withdrawRequestSchema.methods.markDeclined = function() {
  this.status = 'declined';
  this.completedAt = new Date();
  return this.save();
};

// Mark as failed
withdrawRequestSchema.methods.markFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.completedAt = new Date();
  return this.save();
};

// Retry logic
withdrawRequestSchema.methods.canRetry = function() {
  return this.attempts < this.maxAttempts;
};

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
