const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  marketHashName: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['Consumer Grade', 'Industrial Grade', 'Mil-Spec', 'Restricted', 'Classified', 'Covert', 'Exceedingly Rare'],
    default: 'Consumer Grade'
  },
  rarityColor: {
    type: String,
    default: '#b0c3d9'
  },
  category: {
    type: String,
    enum: ['Knife', 'Rifle', 'Pistol', 'SMG', 'Sniper', 'Shotgun', 'Machine Gun', 'Gloves'],
    default: 'Rifle'
  },
  exterior: {
    type: String,
    enum: ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred', 'Not Painted'],
    default: 'Field-Tested'
  },
  float: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  active: {
    type: Boolean,
    default: true
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

// Indexes
skinSchema.index({ marketHashName: 1 });
skinSchema.index({ rarity: 1 });
skinSchema.index({ category: 1 });
skinSchema.index({ active: 1 });

// Helper to get rarity color
skinSchema.statics.getRarityColor = function(rarity) {
  const colors = {
    'Consumer Grade': '#b0c3d9',
    'Industrial Grade': '#5e98d9',
    'Mil-Spec': '#4b69ff',
    'Restricted': '#8847ff',
    'Classified': '#d32ce6',
    'Covert': '#eb4b4b',
    'Exceedingly Rare': '#ffd700'
  };
  return colors[rarity] || '#b0c3d9';
};

module.exports = mongoose.model('Skin', skinSchema);
