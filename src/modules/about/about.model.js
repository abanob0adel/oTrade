import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['vision', 'team'],
    required: true
  },
  // Team fields (not translated)
  image: {
    type: String,
    trim: true
  },
  linkedIn: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
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

// Index for key and order
aboutSchema.index({ key: 1, order: 1 });
aboutSchema.index({ isActive: 1 });

const About = mongoose.model('About', aboutSchema);

export default About;
