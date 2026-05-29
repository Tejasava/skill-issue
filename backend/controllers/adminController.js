const User = require('../models/User');
const SkillExchange = require('../models/SkillExchange');
const Event = require('../models/Event');
const Community = require('../models/Community');
const Project = require('../models/Project');

exports.dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExchanges = await SkillExchange.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalProjects = await Project.countDocuments();
    res.json({ success: true, data: { totalUsers, totalExchanges, totalEvents, totalCommunities, totalProjects } });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find().skip((page - 1) * limit).limit(parseInt(limit)).select('-password');
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ success: true, message: 'User suspended', data: user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.getExchanges = async (req, res, next) => {
  try {
    const exchanges = await SkillExchange.find().populate('requester receiver', '-password');
    res.json({ success: true, data: exchanges });
  } catch (err) { next(err); }
};

exports.deleteExchange = async (req, res, next) => {
  try {
    await SkillExchange.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exchange deleted' });
  } catch (err) { next(err); }
};

exports.reports = async (req, res, next) => {
  try {
    // simple activity report
    const users = await User.countDocuments();
    const exchanges = await SkillExchange.countDocuments();
    const events = await Event.countDocuments();
    res.json({ success: true, data: { users, exchanges, events, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

// Get pending communities for approval
exports.getPendingCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({ status: 'pending' })
      .populate('creator', '-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: communities });
  } catch (err) { next(err); }
};

// Get all communities (admin view)
exports.getCommunities = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const communities = await Community.find(filter)
      .populate('creator', '-password')
      .populate('approvedBy', '-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: communities });
  } catch (err) { next(err); }
};

// Approve a community
exports.approveCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    
    community.status = 'approved';
    // Only set approvedBy if it's not a real user (admin case)
    if (req.user.role === 'admin') {
      community.approvedBy = null; // Admin approved, don't store approver
    } else {
      community.approvedBy = req.user._id;
    }
    community.approvalDate = new Date();
    await community.save();
    
    const updated = await Community.findById(id).populate('creator', '-password').populate('approvedBy', '-password');
    res.json({ success: true, message: 'Community approved', data: updated });
  } catch (err) { next(err); }
};

// Reject a community
exports.rejectCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    
    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    
    community.status = 'rejected';
    community.rejectionReason = reason;
    await community.save();
    
    const updated = await community.populate('creator', '-password');
    res.json({ success: true, message: 'Community rejected', data: updated });
  } catch (err) { next(err); }
};

// Delete a community
exports.deleteCommunityAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Community.findByIdAndDelete(id);
    res.json({ success: true, message: 'Community deleted' });
  } catch (err) { next(err); }
};

// Get community members with details (email, phone)
exports.getCommunityMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const community = await Community.findById(id).populate('members', 'name avatar _id');
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    
    const members = community.members.map(member => {
      const memberDetail = community.memberDetails.find(md => md.userId.toString() === member._id.toString());
      return {
        _id: member._id,
        name: member.name || 'Unknown',
        email: memberDetail?.email || 'N/A',
        phone: memberDetail?.phone || 'N/A',
        avatar: member.avatar || null
      };
    });
    
    res.json({ success: true, data: { members, totalMembers: community.memberCount } });
  } catch (err) { next(err); }
};

// Get all projects (admin view)
exports.getAllProjectsAdmin = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('seller', 'name avatar email')
      .sort({ createdAt: -1 });
    
    const formattedProjects = projects.map(project => ({
      ...project.toObject(),
      seller: project.seller ? {
        ...project.seller.toObject(),
        avatar: project.seller.avatar
      } : null
    }));

    res.json({ success: true, data: formattedProjects });
  } catch (err) { next(err); }
};

// Delete a project (admin)
exports.deleteProjectAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};
