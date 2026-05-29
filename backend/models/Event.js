const mongoose = require('mongoose');

const eventQuestionSchema = new mongoose.Schema({
  question: String,
  type: { type: String, enum: ['text', 'textarea', 'url', 'email', 'number'], default: 'text' },
  required: { type: Boolean, default: true },
  placeholder: String
}, { _id: false });

const eventSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userEmail: String,
  userAvatar: String,
  answers: Map,
  repositoryLink: String,
  deployedLink: String,
  googleDriveLink: String,
  pptLink: String,
  submittedAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  duration: String, // e.g., "2 days", "1 week"
  format: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
  problemStatement: String,
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  deadline: Date,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft' },
  image: String,
  formQuestions: [eventQuestionSchema],
  submissions: [eventSubmissionSchema],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, position: Number }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isAdminEvent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
