import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'master', 'otrade'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // New field for plan-based subscriptions
  subscribedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  // Subscription information
  subscription: {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    duration: { type: String, enum: ['monthly', 'yearly'] },
    startDate: Date,
    endDate: Date
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    select: false
  }
}, {
  timestamps: true 
});

// Create index on email for faster lookups
userSchema.index({ email: 1 });

// Create index on reset token for faster lookups
userSchema.index({ resetPasswordToken: 1 });

const User = mongoose.model('User', userSchema);

export default User;