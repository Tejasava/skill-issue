const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

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

// Helper function to convert user avatars
const convertUserAvatars = (users) => {
  if (Array.isArray(users)) {
    return users.map(user => ({
      ...user.toObject ? user.toObject() : user,
      avatar: user.avatar ? getAvatarUrl(user.avatar) : undefined
    }));
  } else if (users && typeof users === 'object') {
    return {
      ...users.toObject ? users.toObject() : users,
      avatar: users.avatar ? getAvatarUrl(users.avatar) : undefined
    };
  }
  return users;
};

exports.getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', '-password');
    const friends = convertUserAvatars(user.friends);
    res.json({ success: true, data: friends });
  } catch (err) { next(err); }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ to: req.user._id, status: 'pending' }).populate('from', '-password');
    const convertedRequests = requests.map(req => ({
      ...req.toObject(),
      from: convertUserAvatars(req.from)
    }));
    res.json({ success: true, data: convertedRequests });
  } catch (err) { next(err); }
};

exports.sendRequest = async (req, res, next) => {
  try {
    const toUserId = req.params.userId;
    if (toUserId === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot friend yourself' });
    const exists = await FriendRequest.findOne({ from: req.user._id, to: toUserId });
    if (exists) return res.status(400).json({ success: false, message: 'Request already sent' });
    const fr = await FriendRequest.create({ from: req.user._id, to: toUserId });
    res.status(201).json({ success: true, message: 'Request sent', data: fr });
  } catch (err) { next(err); }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const fr = await FriendRequest.findById(req.params.id);
    if (!fr) return res.status(404).json({ success: false, message: 'Not found' });
    if (fr.to.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    fr.status = 'accepted';
    await fr.save();
    // add friends
    const fromUser = await User.findById(fr.from);
    const toUser = await User.findById(fr.to);
    if (!fromUser.friends.includes(toUser._id)) fromUser.friends.push(toUser._id);
    if (!toUser.friends.includes(fromUser._id)) toUser.friends.push(fromUser._id);
    await fromUser.save();
    await toUser.save();
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (err) { next(err); }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const fr = await FriendRequest.findById(req.params.id);
    if (!fr) return res.status(404).json({ success: false, message: 'Not found' });
    if (fr.to.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    fr.status = 'rejected';
    await fr.save();
    res.json({ success: true, message: 'Friend request rejected' });
  } catch (err) { next(err); }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    const me = await User.findById(req.user._id);
    me.friends = me.friends.filter(f => f.toString() !== otherId);
    await me.save();
    const other = await User.findById(otherId);
    other.friends = other.friends.filter(f => f.toString() !== req.user._id.toString());
    await other.save();
    res.json({ success: true, message: 'Friend removed' });
  } catch (err) { next(err); }
};
