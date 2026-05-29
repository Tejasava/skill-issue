const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  techStack: [String],
  githubLink: String,
  liveLink: String,
  screenshots: [String],
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: String,
  isAvailable: { type: Boolean, default: true },
  interestedBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
