const Project = require('../models/Project');
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

// Get all available projects (public)
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ isAvailable: true })
      .populate('seller', 'name avatar email')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      ...project.toObject(),
      seller: project.seller ? {
        ...project.seller.toObject(),
        avatar: getAvatarUrl(project.seller.avatar)
      } : null
    }));

    res.json({ success: true, data: formattedProjects });
  } catch (err) {
    next(err);
  }
};

// Get projects by seller (user specific)
exports.getSellerProjects = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const projects = await Project.find({ seller: sellerId })
      .populate('seller', 'name avatar email')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      ...project.toObject(),
      seller: project.seller ? {
        ...project.seller.toObject(),
        avatar: getAvatarUrl(project.seller.avatar)
      } : null
    }));

    res.json({ success: true, data: formattedProjects });
  } catch (err) {
    next(err);
  }
};

// Get single project details
exports.getProjectDetail = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate('seller', 'name avatar email')
      .populate('interestedBuyers', 'name avatar email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const formattedProject = {
      ...project.toObject(),
      seller: project.seller ? {
        ...project.seller.toObject(),
        avatar: getAvatarUrl(project.seller.avatar)
      } : null,
      interestedBuyers: project.interestedBuyers.map(buyer => ({
        ...buyer.toObject(),
        avatar: getAvatarUrl(buyer.avatar)
      }))
    };

    res.json({ success: true, data: formattedProject });
  } catch (err) {
    next(err);
  }
};

// Create new project
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, githubLink, liveLink, screenshots, price, currency, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required' });
    }

    const project = await Project.create({
      seller: req.user._id,
      title,
      description: description || '',
      techStack: techStack || [],
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      screenshots: screenshots || [],
      price,
      currency: currency || 'INR',
      category: category || 'Other',
      isAvailable: true
    });

    const populatedProject = await project.populate('seller', 'name avatar email');
    const formattedProject = {
      ...populatedProject.toObject(),
      seller: populatedProject.seller ? {
        ...populatedProject.seller.toObject(),
        avatar: getAvatarUrl(populatedProject.seller.avatar)
      } : null
    };

    res.status(201).json({ success: true, message: 'Project created successfully', data: formattedProject });
  } catch (err) {
    next(err);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, techStack, githubLink, liveLink, screenshots, price, currency, category, isAvailable } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization
    if (project.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack) project.techStack = techStack;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (liveLink !== undefined) project.liveLink = liveLink;
    if (screenshots) project.screenshots = screenshots;
    if (price) project.price = price;
    if (currency) project.currency = currency;
    if (category) project.category = category;
    if (isAvailable !== undefined) project.isAvailable = isAvailable;

    await project.save();
    const populatedProject = await project.populate('seller', 'name avatar email');
    const formattedProject = {
      ...populatedProject.toObject(),
      seller: populatedProject.seller ? {
        ...populatedProject.seller.toObject(),
        avatar: getAvatarUrl(populatedProject.seller.avatar)
      } : null
    };

    res.json({ success: true, message: 'Project updated successfully', data: formattedProject });
  } catch (err) {
    next(err);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization
    if (project.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(projectId);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Express interest in a project
exports.expressInterest = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const buyerId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if already interested
    if (project.interestedBuyers.includes(buyerId)) {
      return res.status(400).json({ success: false, message: 'Already interested in this project' });
    }

    project.interestedBuyers.push(buyerId);
    await project.save();

    const populatedProject = await project.populate('seller', 'name avatar email').populate('interestedBuyers', 'name avatar email');
    const formattedProject = {
      ...populatedProject.toObject(),
      seller: populatedProject.seller ? {
        ...populatedProject.seller.toObject(),
        avatar: getAvatarUrl(populatedProject.seller.avatar)
      } : null,
      interestedBuyers: populatedProject.interestedBuyers.map(buyer => ({
        ...buyer.toObject(),
        avatar: getAvatarUrl(buyer.avatar)
      }))
    };

    res.json({ success: true, message: 'Interest expressed', data: formattedProject });
  } catch (err) {
    next(err);
  }
};

// Remove interest from project
exports.removeInterest = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const buyerId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Remove buyer from interested list
    project.interestedBuyers = project.interestedBuyers.filter(
      id => id.toString() !== buyerId.toString()
    );
    await project.save();

    const populatedProject = await project.populate('seller', 'name avatar email').populate('interestedBuyers', 'name avatar email');
    const formattedProject = {
      ...populatedProject.toObject(),
      seller: populatedProject.seller ? {
        ...populatedProject.seller.toObject(),
        avatar: getAvatarUrl(populatedProject.seller.avatar)
      } : null,
      interestedBuyers: populatedProject.interestedBuyers.map(buyer => ({
        ...buyer.toObject(),
        avatar: getAvatarUrl(buyer.avatar)
      }))
    };

    res.json({ success: true, message: 'Interest removed', data: formattedProject });
  } catch (err) {
    next(err);
  }
};

// Get projects by seller (admin view)
exports.getProjectsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ seller: userId })
      .populate('seller', 'name avatar email')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      ...project.toObject(),
      seller: project.seller ? {
        ...project.seller.toObject(),
        avatar: getAvatarUrl(project.seller.avatar)
      } : null
    }));

    res.json({ success: true, data: formattedProjects });
  } catch (err) {
    next(err);
  }
};
