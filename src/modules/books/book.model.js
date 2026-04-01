import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  // ===== Free / Paid =====
  isFree: {
    type: Boolean,
    default: true // All books are free
  },

  plans: {
    type: [String],
    default: [] // All books are free, so no plans needed
  },

  // ===== Content =====
  title: {
    type: String,
  
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
    default: false // All books are free
  },

  isInSubscription: {
    type: Boolean,
    default: false // All books are free
  },

  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

export default Book;