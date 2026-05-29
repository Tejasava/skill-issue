const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const projectCtrl = require('../controllers/projectController');

// Public routes
router.get('/', projectCtrl.getAllProjects);
router.get('/:projectId', projectCtrl.getProjectDetail);

// User routes
router.get('/user/projects', auth, projectCtrl.getSellerProjects);
router.post('/', auth, projectCtrl.createProject);
router.put('/:projectId', auth, projectCtrl.updateProject);
router.delete('/:projectId', auth, projectCtrl.deleteProject);
router.post('/:projectId/interest', auth, projectCtrl.expressInterest);
router.delete('/:projectId/interest', auth, projectCtrl.removeInterest);

// Admin routes
router.get('/admin/:userId', admin, projectCtrl.getProjectsByUser);

module.exports = router;
