const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
});

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  tags: [String],
  avatar: String,
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberDetails: [communityMemberSchema],
  memberCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isAdminCreated: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvalDate: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Community', communitySchema);
