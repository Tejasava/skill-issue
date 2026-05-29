const mongoose = require('mongoose');

const SkillExchangeSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterSkill: String,
  receiverSkill: String,
  exchangeType: { type: String, enum: ['barter', 'paid', 'free'] },
  amount: { type: Number, default: 0 },
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SkillExchange', SkillExchangeSchema);
