const Event = require('../models/Event');
const User = require('../models/User');

// Admin: Create a new event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, price, duration, format, maxParticipants, startDate, endDate, formQuestions } = req.body;

    if (!title || !maxParticipants || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if user is admin
    const isAdmin = req.user.id === 'admin' && req.user.role === 'admin';

    const event = await Event.create({
      title,
      description,
      price: price || 0,
      duration,
      format: format || 'online',
      maxParticipants,
      startDate,
      endDate,
      status: 'draft',
      formQuestions: formQuestions || [],
      createdBy: isAdmin ? null : req.user._id,
      isAdminEvent: isAdmin,
    });

    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) { next(err); }
};

// Admin: Update event details
exports.updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, price, duration, format, maxParticipants, startDate, endDate, formQuestions, status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Allow admins to update any event, or users to update their own events
    if (req.user.id !== 'admin' && event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (price !== undefined) event.price = price;
    if (duration) event.duration = duration;
    if (format) event.format = format;
    if (maxParticipants) event.maxParticipants = maxParticipants;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (formQuestions) event.formQuestions = formQuestions;
    if (status) event.status = status;
    event.updatedAt = Date.now();

    await event.save();
    res.json({ success: true, message: 'Event updated', data: event });
  } catch (err) { next(err); }
};

// Admin: Add form questions
exports.addFormQuestions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { questions } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Allow admins to update any event, or users to update their own events
    if (req.user.id !== 'admin' && event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    event.formQuestions = questions || [];
    await event.save();

    res.json({ success: true, message: 'Form questions added', data: event });
  } catch (err) { next(err); }
};

// Admin: Publish event (change status to active)
exports.publishEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Allow admins to publish any event, or users to publish their own events
    if (req.user.id !== 'admin' && event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    event.status = 'active';
    await event.save();

    res.json({ success: true, message: 'Event published', data: event });
  } catch (err) { next(err); }
};

// User: Get all active events
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'active' })
      .populate('createdBy', 'name email')
      .populate('participants', 'name avatar');

    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// User: Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('participants', 'name avatar email');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// User: Join event and submit form
exports.submitEventForm = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { answers, repositoryLink, deployedLink, googleDriveLink, pptLink } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check if max participants reached
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check if user already submitted
    const existingSubmission = event.submissions.find(s => s.userId.toString() === req.user._id.toString());
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'You have already submitted for this event' });
    }

    const user = await User.findById(req.user._id);

    // Add submission with user details
    event.submissions.push({
      userId: req.user._id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      answers: new Map(Object.entries(answers || {})),
      repositoryLink,
      deployedLink,
      googleDriveLink,
      pptLink,
    });

    // Add participant if not already added
    if (!event.participants.includes(req.user._id)) {
      event.participants.push(req.user._id);
      event.currentParticipants += 1;
    }

    await event.save();

    res.status(201).json({ success: true, message: 'Form submitted successfully', data: event });
  } catch (err) { next(err); }
};

// Admin: Get all submissions for an event
exports.getEventSubmissions = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('submissions.userId', 'name email avatar');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check if user is admin or event creator
    const isAdmin = req.user.id === 'admin' && req.user.role === 'admin';
    const isOwner = event.createdBy && event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: event.submissions });
  } catch (err) { next(err); }
};

// Admin: Get all events created by admin
exports.getAdminEvents = async (req, res, next) => {
  try {
    // If admin user, get all admin events
    if (req.user.id === 'admin' && req.user.role === 'admin') {
      const events = await Event.find({ isAdminEvent: true })
        .populate('participants', 'name avatar')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: events });
    }

    // Otherwise, get events created by the user
    const events = await Event.find({ createdBy: req.user._id })
      .populate('participants', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// Admin: Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Allow admins to delete any event, or users to delete their own events
    if (req.user.id !== 'admin' && event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

// Admin: Get event details with submissions
exports.getEventDetail = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('participants', 'name avatar email');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Allow admins to access any event, or users to access their own events
    const isAdmin = req.user.id === 'admin' && req.user.role === 'admin';
    const isOwner = event.createdBy && event.createdBy._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// Admin: Check if user has already joined
exports.checkUserJoined = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.query;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const hasJoined = event.participants.includes(userId);
    const hasSubmitted = event.submissions.some(s => s.userId.toString() === userId);

    res.json({ success: true, data: { hasJoined, hasSubmitted } });
  } catch (err) { next(err); }
};
