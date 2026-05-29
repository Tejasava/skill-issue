const mongoose = require('mongoose');

const uploadedWorkSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  image: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  phone: String,
  bio: String,
  githubLink: String,
  portfolioLink: String,
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  skillsKnown: [String],
  skillsWanted: [String],
  achievements: [String],
  uploadedWork: [uploadedWorkSchema],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
