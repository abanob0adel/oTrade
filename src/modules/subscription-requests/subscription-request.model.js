import mongoose from 'mongoose';

const subscriptionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  duration: {
    type: String,
    enum: ['monthly', 'quarterly', 'semiAnnual', 'yearly'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
subscriptionRequestSchema.index({ user: 1, status: 1 });
subscriptionRequestSchema.index({ status: 1, createdAt: -1 });

const SubscriptionRequest = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);

export default SubscriptionRequest;
