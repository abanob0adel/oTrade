import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  coverImage: {
    type: String,
    required: true
  },
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

// Index for active categories
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('MarketAnalysisCategory', categorySchema);

export default Category;
