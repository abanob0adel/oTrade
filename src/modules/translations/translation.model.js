import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: [
      'course',
      'strategy',
      'analysis',
      'webinar',
      'psychology',
      'analyst',
      'testimonial',
      'books',
      'articles',
      'lesson',
      'gold',
      'forex',
      'bitcoin',
      'market-analysis',
      'market-category',
      'market-analysis-update',
      'about-settings',
      'about-team',
      'partner',
      'indicator',
      'expert-advisor',
      'ea-key-feature',
      'ea-recommendation',
      'ea-pro',
      'ea-con',
      'ea-update'
    ],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    required: true
  },
  title: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  content: {
    type: String
  }
}, {
  timestamps: true
});

// Compound unique index on (entityType, entityId, language)
translationSchema.index({ entityType: 1, entityId: 1, language: 1 }, { unique: true });

const Translation = mongoose.model('Translation', translationSchema);

export default Translation;