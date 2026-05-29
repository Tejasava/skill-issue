const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/adminController');

router.get('/dashboard', auth, admin, ctrl.dashboard);
router.get('/users', auth, admin, ctrl.getUsers);
router.put('/users/:id/suspend', auth, admin, ctrl.suspendUser);
router.delete('/users/:id', auth, admin, ctrl.deleteUser);
router.get('/exchanges', auth, admin, ctrl.getExchanges);
router.delete('/exchanges/:id', auth, admin, ctrl.deleteExchange);
router.get('/reports', auth, admin, ctrl.reports);

// Community management routes
router.get('/communities', auth, admin, ctrl.getCommunities);
router.get('/communities/pending', auth, admin, ctrl.getPendingCommunities);
router.get('/communities/:id/members', auth, admin, ctrl.getCommunityMembers);
router.put('/communities/:id/approve', auth, admin, ctrl.approveCommunity);
router.put('/communities/:id/reject', auth, admin, ctrl.rejectCommunity);
router.delete('/communities/:id', auth, admin, ctrl.deleteCommunityAdmin);

// Project management routes
router.get('/projects', auth, admin, ctrl.getAllProjectsAdmin);
router.delete('/projects/:id', auth, admin, ctrl.deleteProjectAdmin);

module.exports = router;

