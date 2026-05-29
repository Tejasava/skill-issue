const SkillExchange = require('../models/SkillExchange');
const Conversation = require('../models/Conversation');
const { getIO } = require('../config/socket');

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

// Helper function to convert exchange data
const convertExchangeAvatars = (exchange) => {
  const obj = exchange.toObject ? exchange.toObject() : exchange;
  if (obj.requester && obj.requester.avatar) {
    obj.requester.avatar = getAvatarUrl(obj.requester.avatar);
  }
  if (obj.receiver && obj.receiver.avatar) {
    obj.receiver.avatar = getAvatarUrl(obj.receiver.avatar);
  }
  return obj;
};

exports.createExchange = async (req, res, next) => {
  try {
    console.log("📤 POST /api/exchanges - createExchange called");
    console.log("👤 requester (from token):", req.user?._id);
    console.log("📝 request body:", req.body);
    
    const payload = { ...req.body, requester: req.user._id };
    console.log("💾 Creating exchange with payload:", payload);
    
    const exchange = await SkillExchange.create(payload);
    console.log("✅ Exchange created:", exchange._id);
    
    // notify receiver via socket
    const io = getIO();
    if (io && exchange.receiver) {
      console.log("📡 Emitting exchangeRequest to receiver:", exchange.receiver.toString());
      io.to(exchange.receiver.toString()).emit('exchangeRequest', exchange);
    }
    
    res.status(201).json({ success: true, message: 'Exchange requested', data: exchange });
  } catch (err) { 
    console.error("❌ Error in createExchange:", err);
    next(err); 
  }
};

exports.getMyExchanges = async (req, res, next) => {
  try {
    const exchanges = await SkillExchange.find({ $or: [{ requester: req.user._id }, { receiver: req.user._id }] }).populate('requester receiver', '-password');
    const convertedExchanges = exchanges.map(convertExchangeAvatars);
    res.json({ success: true, data: convertedExchanges });
  } catch (err) { next(err); }
};

exports.getAllExchangesAdmin = async (req, res, next) => {
  try {
    const exchanges = await SkillExchange.find().populate('requester receiver', '-password');
    const convertedExchanges = exchanges.map(convertExchangeAvatars);
    res.json({ success: true, data: convertedExchanges });
  } catch (err) { next(err); }
};

exports.respond = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // accept or reject
    const exchange = await SkillExchange.findById(id);
    if (!exchange) return res.status(404).json({ success: false, message: 'Not found' });
    if (exchange.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    exchange.status = action === 'accept' ? 'accepted' : 'rejected';
    await exchange.save();
    // if accepted create conversation
    if (exchange.status === 'accepted') {
      let conv = await Conversation.findOne({ participants: { $all: [exchange.requester, exchange.receiver] } });
      if (!conv) conv = await Conversation.create({ participants: [exchange.requester, exchange.receiver], lastMessage: 'Exchange accepted' });
    }
    // notify requester
    const io = getIO();
    if (io && exchange.requester) io.to(exchange.requester.toString()).emit('exchangeResponse', exchange);
    res.json({ success: true, message: 'Responded', data: exchange });
  } catch (err) { next(err); }
};

exports.complete = async (req, res, next) => {
  try {
    const exchange = await SkillExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ success: false, message: 'Not found' });
    exchange.status = 'completed';
    await exchange.save();
    res.json({ success: true, message: 'Marked completed', data: exchange });
  } catch (err) { next(err); }
};

exports.stats = async (req, res, next) => {
  try {
    const total = await SkillExchange.countDocuments();
    const pending = await SkillExchange.countDocuments({ status: 'pending' });
    const accepted = await SkillExchange.countDocuments({ status: 'accepted' });
    res.json({ success: true, data: { total, pending, accepted } });
  } catch (err) { next(err); }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const completed = await SkillExchange.countDocuments({ 
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
      status: 'completed'
    });
    res.json({ success: true, data: { completed } });
  } catch (err) { next(err); }
};
