import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  // Translations stored separately in Translation collection
  // We only store reference data here
  videoUrl: {
    type: String,
    default: null
  },
  contentUrl: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  isFree: {
    type: Boolean,
    default: false
  },

  plans: {
    type: [String],
    required: function () {
      return !this.isFree; // 👈 لو مش فري لازم plans
    }
  },

  contentUrl: String,
  coverImageUrl: String,

  // محسوبة تلقائي
  isPaid: {
    type: Boolean,
    default: false
  },
  isInSubscription: {
    type: Boolean,
    default: false
  },

  slug: {
    type: String,
    unique: true,
    sparse: true
  },

  // Lessons array
  lessons: [lessonSchema]
}, { timestamps: true });


const Course = mongoose.model('Course', courseSchema);

export default Course;