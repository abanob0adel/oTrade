import mongoose from 'mongoose';

const goldInfoSchema = new mongoose.Schema({
  // Translations stored separately in Translation collection
  // Only store reference data here
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

// Only allow one gold info document
goldInfoSchema.statics.getInfo = async function() {
  let info = await this.findOne();
  
  // If no info exists, create default one
  if (!info) {
    info = await this.create({
      coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'
    });
  }
  
  return info;
};

const GoldInfo = mongoose.model('GoldInfo', goldInfoSchema);

export default GoldInfo;
