const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: String,
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ 'participants': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
