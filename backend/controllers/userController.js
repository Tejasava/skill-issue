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

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, skill } = req.query;
    const query = {};
    if (skill) query.skillsKnown = skill;
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    
    // Convert avatar paths to accessible URLs
    users.forEach(user => {
      if (user.avatar) {
        user.avatar = getAvatarUrl(user.avatar);
      }
    });
    
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Convert avatar path to accessible URL
    if (user.avatar) {
      const originalAvatar = user.avatar;
      user.avatar = getAvatarUrl(user.avatar);
      console.log(`🖼️ Avatar conversion: ${originalAvatar} -> ${user.avatar}`);
    }
    
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone, experienceLevel, skillsKnown, skillsWanted } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (bio) updates.bio = bio;
    if (phone) updates.phone = phone;
    if (experienceLevel) updates.experienceLevel = experienceLevel;
    if (skillsKnown) updates.skillsKnown = typeof skillsKnown === 'string' ? JSON.parse(skillsKnown) : skillsKnown;
    if (skillsWanted) updates.skillsWanted = typeof skillsWanted === 'string' ? JSON.parse(skillsWanted) : skillsWanted;
    
    // Handle avatar file upload
    if (req.file) {
      console.log('📁 File upload received:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        path: req.file.path,
        secure_url: req.file.secure_url,
        url: req.file.url,
      });
      
      // Use secure_url from Cloudinary if available, otherwise use local path
      updates.avatar = req.file.secure_url || req.file.path;
      console.log('💾 Avatar set to:', updates.avatar);
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    
    // Convert avatar path to accessible URL
    if (user.avatar) {
      user.avatar = getAvatarUrl(user.avatar);
    }
    
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) { next(err); }
};

exports.uploadWork = async (req, res, next) => {
  try {
    const { title, description, link } = req.body;
    const image = req.file ? req.file.secure_url : undefined;
    const work = { title, description, link, image };
    const user = await User.findById(req.user._id);
    user.uploadedWork.push(work);
    await user.save();
    res.status(201).json({ success: true, message: 'Work uploaded', data: work });
  } catch (err) { next(err); }
};

exports.deleteWork = async (req, res, next) => {
  try {
    const { workId } = req.params;
    const user = await User.findById(req.user._id);
    user.uploadedWork = user.uploadedWork.filter(w => w._id.toString() !== workId);
    await user.save();
    res.json({ success: true, message: 'Work removed' });
  } catch (err) { next(err); }
};
