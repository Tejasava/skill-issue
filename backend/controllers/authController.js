const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Helper function to convert avatar paths to accessible URLs
const getAvatarUrl = (avatar) => {
  if (!avatar) return undefined;
  
  // If it's already a full URL (Cloudinary or HTTP), return as-is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // If it's a local path, convert to absolute URL
  if (avatar.startsWith('/uploads/')) {
    // For development, use localhost; for production, use the actual host
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.API_HOST || `localhost:${process.env.PORT || 5001}`;
    return `${protocol}://${host}${avatar}`;
  }
  
  // Default: assume it's a local path
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.API_HOST || `localhost:${process.env.PORT || 5001}`;
  return `${protocol}://${host}/uploads/${avatar}`;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash });
    const token = generateToken({ id: user._id, role: user.role });
    res.status(201).json({ success: true, message: 'User registered', data: { token, user } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken({ id: user._id, role: user.role });
    res.json({ success: true, message: 'Login successful', data: { token, user } });
  } catch (err) { next(err); }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { adminId, password } = req.body;
    if (!adminId || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
    
    const envAdminId = process.env.ADMIN_ID || 'Ucer@26';
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'United2226';
    
    if (adminId !== envAdminId || password !== envAdminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    const token = generateToken({ id: 'admin', role: 'admin' });
    res.json({ success: true, message: 'Admin authenticated', data: { token, user: { _id: 'admin', id: 'admin', role: 'admin', name: 'Admin', email: 'admin@skillissue.com', skillsKnown: [], skillsWanted: [] } } });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    if (req.user.id === 'admin') return res.json({ success: true, data: req.user });
    const user = await User.findById(req.user._id).select('-password');
    
    // Convert avatar path to accessible URL
    if (user && user.avatar) {
      user.avatar = getAvatarUrl(user.avatar);
    }
    
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
