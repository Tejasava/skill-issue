const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const eventCtrl = require('../controllers/eventController');

// Admin routes - MUST come before /:eventId routes
router.get('/admin/all', auth, adminMiddleware, eventCtrl.getAdminEvents);
router.get('/admin/:eventId', auth, adminMiddleware, eventCtrl.getEventDetail);
router.post('/', auth, adminMiddleware, eventCtrl.createEvent);
router.put('/:eventId', auth, adminMiddleware, eventCtrl.updateEvent);
router.put('/:eventId/questions', auth, adminMiddleware, eventCtrl.addFormQuestions);
router.put('/:eventId/publish', auth, adminMiddleware, eventCtrl.publishEvent);
router.get('/:eventId/submissions', auth, adminMiddleware, eventCtrl.getEventSubmissions);
router.delete('/:eventId', auth, adminMiddleware, eventCtrl.deleteEvent);

// User routes - MUST come after admin routes
router.get('/', eventCtrl.getAllEvents);
router.get('/:eventId', eventCtrl.getEventById);
router.get('/:eventId/check', auth, eventCtrl.checkUserJoined);
router.post('/:eventId/submit', auth, eventCtrl.submitEventForm);

module.exports = router;
