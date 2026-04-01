import mongoose from 'mongoose';

// Settings Model - for general content with key (vision, mission, about, etc.)
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
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

settingsSchema.index({ key: 1 });
settingsSchema.index({ isActive: 1 });

// Team Model - for team members
const teamSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
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

teamSchema.index({ order: 1 });
teamSchema.index({ isActive: 1 });

export const Settings = mongoose.model('Settings', settingsSchema);
export const Team = mongoose.model('Team', teamSchema);
