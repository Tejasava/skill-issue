const mongoose = require('mongoose');

const eventParticipantSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submission: String,
  submittedAt: Date,
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventParticipant', eventParticipantSchema);
