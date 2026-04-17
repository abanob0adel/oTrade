import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  coverImageUrl: { type: String },
  title: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const indicatorSchema = new mongoose.Schema({
  coverImageUrl: { type: String },
  date: { type: Date, default: Date.now },
  plans: { type: [String], required: true },
  updates: [updateSchema]
}, { timestamps: true });

const Indicator = mongoose.model('Indicator', indicatorSchema);

export default Indicator;
