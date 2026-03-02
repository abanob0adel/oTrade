import mongoose from 'mongoose';

const marketAnalysisSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketAnalysisCategory',
    required: true,
    index: true
  },
  coverImage: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  updates: [{
    image: {
      type: String,
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
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

// Compound index for category + active status
marketAnalysisSchema.index({ category: 1, isActive: 1 });

const MarketAnalysis = mongoose.model('MarketAnalysis', marketAnalysisSchema);

export default MarketAnalysis;
