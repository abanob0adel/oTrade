import mongoose from 'mongoose';

const forexInfoSchema = new mongoose.Schema({
  // Translations stored separately in Translation collection
  // Only store reference data here
  coverImage: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'
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

// Only allow one forex info document
forexInfoSchema.statics.getInfo = async function() {
  let info = await this.findOne();
  
  // If no info exists, create default one
  if (!info) {
    info = await this.create({
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'
    });
  }
  
  return info;
};

const ForexInfo = mongoose.model('ForexInfo', forexInfoSchema);

export default ForexInfo;
