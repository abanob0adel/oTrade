import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  // ===== Free / Paid =====
  isFree: {
    type: Boolean,
    default: true // All articles are free
  },

  plans: {
    type: [String],
    default: [] // All articles are free, so no plans needed
  },

  // ===== Content =====
  title: {
    type: String,
    required: true,
    index: true
  },

  contentUrl: String,
  coverImageUrl: String,
  fileUrl: String,
  videoUrl: String,
  pdfUrl: String,

  // ===== Access Control =====
  isActive: {
    type: Boolean,
    default: true
  },

  // ===== Computed Fields =====
  isPaid: {
    type: Boolean,
    default: false // All articles are free
  },

  isInSubscription: {
    type: Boolean,
    default: false // All articles are free
  },

  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

export default Article;