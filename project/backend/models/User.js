const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    default: null
  },
  firstName: {
    type: String,
    default: null
  },
  lastName: {
    type: String,
    default: null
  },
  crystals: {
    type: Number,
    default: 100,
    min: 0
  },
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  steamTradeUrl: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ telegramId: 1 });

// Update lastLogin on each authentication
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Add crystals to user balance
userSchema.methods.addCrystals = function(amount) {
  this.crystals += amount;
  this.totalDeposited += amount;
  return this.save();
};

// Deduct crystals from user balance
userSchema.methods.deductCrystals = function(amount) {
  if (this.crystals < amount) {
    throw new Error('Insufficient crystals');
  }
  this.crystals -= amount;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
