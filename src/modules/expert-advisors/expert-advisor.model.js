import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  coverImageUrl: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// keyFeature & recommendation sub-docs store only IDs for translations
const keyFeatureSchema = new mongoose.Schema({}, { timestamps: true });

const prosConsSchema = new mongoose.Schema({
  type: { type: String, enum: ['pro', 'con'], required: true }
}, { timestamps: true });

const recommendationSchema = new mongoose.Schema({
  performanceSummary: [
    {
      en: { type: String, default: '' },
      ar: { type: String, default: '' }
    }
  ]
}, { timestamps: true });

const expertAdvisorSchema = new mongoose.Schema({
  coverImageUrl: { type: String },
  date: { type: Date, default: Date.now },
  plans: { type: [String], required: true },
  updates: [updateSchema],
  keyFeatures: [keyFeatureSchema],
  recommendations: [recommendationSchema],
  pros: [prosConsSchema],
  cons: [prosConsSchema]
}, { timestamps: true });

const ExpertAdvisor = mongoose.model('ExpertAdvisor', expertAdvisorSchema);

export default ExpertAdvisor;
