const Community = require('../models/Community');
const User = require('../models/User');

// Helper function to convert avatar paths to accessible URLs
const getAvatarUrl = (avatar) => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/uploads/')) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.API_HOST || `localhost:${process.env.PORT || 5001}`;
    return `${protocol}://${host}${avatar}`;
  }
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.API_HOST || `localhost:${process.env.PORT || 5001}`;
  return `${protocol}://${host}/uploads/${avatar}`;
};

const convertCommunityAvatars = (community) => ({
  ...community.toObject(),
  avatar: getAvatarUrl(community.avatar),
  creator: community.creator ? {
    ...community.creator.toObject(),
    avatar: getAvatarUrl(community.creator.avatar)
  } : null
});

// Admin: Create a new community
exports.createCommunity = async (req, res, next) => {
  try {
    const { name, description, tags, avatar, privacy } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Community name is required' });
    }

    // Check if user is admin
    const isAdmin = req.user.role === 'admin';

    const community = await Community.create({
      name,
      description: description || '',
      tags: tags || [],
      avatar: avatar || null,
      privacy: privacy || 'public',
      creator: isAdmin ? undefined : req.user._id, // undefined will be ignored by schema, null can cause issues
      members: isAdmin ? [] : [req.user._id],
      memberCount: isAdmin ? 0 : 1,
      status: 'approved', // Admin communities are auto-approved
      isAdminCreated: isAdmin,
      approvedBy: undefined,
      approvalDate: isAdmin ? new Date() : undefined
    });

    const populatedCommunity = await community.populate('creator', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.status(201).json({ 
      success: true, 
      message: isAdmin ? 'Community created' : 'Community created and waiting for approval',
      data: converted 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Community name already exists' });
    }
    next(err);
  }
};

// User: Create a community (requires admin approval)
// Also handles admin users creating communities (will auto-approve)
exports.createCommunityUser = async (req, res, next) => {
  try {
    const { name, description, tags, avatar, privacy } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Community name is required' });
    }

    // Check if user is admin
    const isAdmin = req.user.role === 'admin';

    const community = await Community.create({
      name,
      description: description || '',
      tags: tags || [],
      avatar: avatar || null,
      privacy: privacy || 'public',
      creator: isAdmin ? undefined : req.user._id,
      members: isAdmin ? [] : [req.user._id],
      memberCount: isAdmin ? 0 : 1,
      status: isAdmin ? 'approved' : 'pending',
      isAdminCreated: isAdmin,
      approvalDate: isAdmin ? new Date() : undefined
    });

    const populatedCommunity = await community.populate('creator', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.status(201).json({ 
      success: true, 
      message: isAdmin ? 'Community created' : 'Community created! Waiting for admin approval',
      data: converted 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Community name already exists' });
    }
    next(err);
  }
};

// Get all approved communities (for users)
exports.getAllApprovedCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({ status: 'approved' })
      .populate('creator', '-password')
      .sort({ createdAt: -1 });
    
    const converted = communities.map(convertCommunityAvatars);
    res.json({ success: true, data: converted });
  } catch (err) {
    next(err);
  }
};

// Get user's own communities (including pending)
exports.getUserCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({ creator: req.user._id })
      .populate('creator', '-password')
      .sort({ createdAt: -1 });
    
    const converted = communities.map(convertCommunityAvatars);
    res.json({ success: true, data: converted });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all communities (pending, approved, rejected)
exports.getAllCommunities = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const communities = await Community.find(filter)
      .populate('creator', '-password')
      .populate('approvedBy', '-password')
      .sort({ createdAt: -1 });
    
    const converted = communities.map(convertCommunityAvatars);
    res.json({ success: true, data: converted });
  } catch (err) {
    next(err);
  }
};

// Admin: Approve a community
exports.approveCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { reason } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    community.status = 'approved';
    // Only set approvedBy if it's not a real user (admin case)
    if (req.user.role === 'admin') {
      community.approvedBy = null; // Admin approved, don't store approver
    } else {
      community.approvedBy = req.user._id;
    }
    community.approvalDate = new Date();
    await community.save();

    const populatedCommunity = await community.populate('creator', '-password').populate('approvedBy', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.json({ 
      success: true, 
      message: 'Community approved successfully',
      data: converted 
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Reject a community
exports.rejectCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    community.status = 'rejected';
    community.rejectionReason = reason;
    await community.save();

    const populatedCommunity = await community.populate('creator', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.json({ 
      success: true, 
      message: 'Community rejected',
      data: converted 
    });
  } catch (err) {
    next(err);
  }
};

// Get community details
exports.getCommunityDetail = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId)
      .populate('creator', '-password')
      .populate('members', '-password');

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Check if user can view this community
    if (community.status !== 'approved' && (!req.user || community.creator.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Community not accessible' });
    }

    const converted = convertCommunityAvatars(community);
    res.json({ success: true, data: converted });
  } catch (err) {
    next(err);
  }
};

// Join a community
exports.joinCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { phone, email } = req.body;

    // Validate phone and email
    if (!phone || !email) {
      return res.status(400).json({ success: false, message: 'Phone number and email are required' });
    }

    // Admins cannot join communities
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot join communities' });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    if (community.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Community is not available' });
    }

    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    community.members.push(req.user._id);
    community.memberDetails.push({
      userId: req.user._id,
      email: email.trim(),
      phone: phone.trim()
    });
    community.memberCount = community.members.length;
    await community.save();

    const populatedCommunity = await Community.findById(communityId).populate('creator', '-password').populate('members', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.json({ 
      success: true, 
      message: 'Joined community successfully',
      data: converted 
    });
  } catch (err) {
    next(err);
  }
};

// Leave a community
exports.leaveCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    
    // Admins cannot leave communities (they don't join)
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot leave communities' });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const memberIndex = community.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, message: 'Not a member' });
    }

    community.members.splice(memberIndex, 1);
    
    // Also remove from memberDetails
    const detailIndex = community.memberDetails.findIndex(
      detail => detail.userId.toString() === req.user._id.toString()
    );
    if (detailIndex !== -1) {
      community.memberDetails.splice(detailIndex, 1);
    }
    
    community.memberCount = community.members.length;
    await community.save();

    const populatedCommunity = await Community.findById(communityId).populate('creator', '-password').populate('members', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);


    res.json({ 
      success: true, 
      message: 'Left community successfully',
      data: converted 
    });
  } catch (err) {
    next(err);
  }
};

// Update community details (creator or admin only)
exports.updateCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { description, tags, privacy } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Check authorization
    const isAdmin = req.user.id === 'admin' && req.user.role === 'admin';
    if (!isAdmin && community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (description) community.description = description;
    if (tags) community.tags = tags;
    if (privacy) community.privacy = privacy;
    community.updatedAt = new Date();

    await community.save();
    const populatedCommunity = await community.populate('creator', '-password');
    const converted = convertCommunityAvatars(populatedCommunity);

    res.json({ 
      success: true, 
      message: 'Community updated',
      data: converted 
    });
  } catch (err) {
    next(err);
  }
};

// Delete community (creator or admin only)
exports.deleteCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Check authorization
    const isAdmin = req.user.id === 'admin' && req.user.role === 'admin';
    if (!isAdmin && community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Community.findByIdAndDelete(communityId);

    res.json({ 
      success: true, 
      message: 'Community deleted' 
    });
  } catch (err) {
    next(err);
  }
};

// Get pending communities (admin only)
exports.getPendingCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({ status: 'pending' })
      .populate('creator', '-password')
      .sort({ createdAt: -1 });
    
    const converted = communities.map(convertCommunityAvatars);
    res.json({ success: true, data: converted });
  } catch (err) {
    next(err);
  }
};

// Get community member details (everyone can view, but phone only for creator/admin)
exports.getCommunityMemberDetails = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('memberDetails.userId', 'name avatar');

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Check if user can see phone numbers (only creator or admin)
    const isAdmin = req.user && req.user.role === 'admin';
    const isCreator = req.user && community.creator && community.creator.toString() === req.user._id.toString();
    const canSeePhone = isAdmin || isCreator;
    const canSeeEmail = isAdmin || isCreator;

    // Build member details - if memberDetails is empty, use members array as fallback
    let memberDetails = [];

    if (community.memberDetails && community.memberDetails.length > 0) {
      // Use memberDetails if available
      memberDetails = community.memberDetails.map(detail => ({
        userId: detail.userId._id,
        userName: detail.userId.name,
        userAvatar: getAvatarUrl(detail.userId.avatar),
        email: canSeeEmail ? detail.email : null,
        phone: canSeePhone ? detail.phone : null,
        joinedAt: detail.joinedAt
      }));
    } else if (community.members && community.members.length > 0) {
      // Fallback: Use members array if memberDetails is empty
      memberDetails = community.members.map(member => ({
        userId: member._id,
        userName: member.name,
        userAvatar: getAvatarUrl(member.avatar),
        email: null, // No email available when using members fallback
        phone: null, // No phone available when using members fallback
        joinedAt: community.createdAt // Use community creation date as fallback
      }));
    }

    res.json({ 
      success: true, 
      data: {
        communityName: community.name,
        totalMembers: community.memberCount,
        memberDetails: memberDetails,
        canSeePhone: canSeePhone,
        canSeeEmail: canSeeEmail
      }
    });
  } catch (err) {
    next(err);
  }
};
