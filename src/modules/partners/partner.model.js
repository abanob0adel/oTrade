import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['people', 'company'],
    required: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  websiteUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  links: [{
    label: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
          return urlRegex.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    }
  }],
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

partnerSchema.index({ category: 1, order: 1 });
partnerSchema.index({ isActive: 1 });

export default mongoose.model('Partner', partnerSchema);
