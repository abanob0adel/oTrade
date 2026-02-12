import mongoose from 'mongoose';

const goldConfigSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    default: 'Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.'
  },
  coverImage: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'
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

// Only allow one config document
goldConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  
  // If no config exists, create default one
  if (!config) {
    config = await this.create({
      description: 'Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.',
      coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'
    });
  }
  
  return config;
};

const GoldConfig = mongoose.model('GoldConfig', goldConfigSchema);

export default GoldConfig;
