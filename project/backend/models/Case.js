const mongoose = require('mongoose');

const caseContentSchema = new mongoose.Schema({
  skinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skin',
    required: true
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const caseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  contents: [caseContentSchema],
  active: {
    type: Boolean,
    default: true
  },
  totalOpened: {
    type: Number,
    default: 0
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

// Index
caseSchema.index({ active: 1 });
caseSchema.index({ name: 1 });

// Validate that probabilities sum to 100
caseSchema.pre('save', function(next) {
  if (this.contents && this.contents.length > 0) {
    const totalProbability = this.contents.reduce((sum, item) => sum + item.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {
      return next(new Error('Case probabilities must sum to 100'));
    }
  }
  next();
});

// Method to get a random skin based on probabilities
caseSchema.methods.getRandomSkin = function() {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const item of this.contents) {
    cumulative += item.probability;
    if (random <= cumulative) {
      return item.skinId;
    }
  }

  // Fallback to last item if something goes wrong
  return this.contents[this.contents.length - 1].skinId;
};

module.exports = mongoose.model('Case', caseSchema);
