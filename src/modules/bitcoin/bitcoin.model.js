import mongoose from 'mongoose';

const bitcoinInfoSchema = new mongoose.Schema({
  // Translations stored separately in Translation collection
  // Only store reference data here
  coverImage: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'
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

// Only allow one bitcoin info document
bitcoinInfoSchema.statics.getInfo = async function() {
  let info = await this.findOne();
  
  // If no info exists, create default one
  if (!info) {
    info = await this.create({
      coverImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'
    });
  }
  
  return info;
};

const BitcoinInfo = mongoose.model('BitcoinInfo', bitcoinInfoSchema);

export default BitcoinInfo;
