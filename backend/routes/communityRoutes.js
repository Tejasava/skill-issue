const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const communityCtrl = require('../controllers/communityController');

// Admin routes - Create communities as admin (auto-approved)
router.post('/admin', auth, admin, communityCtrl.createCommunity);

// Admin routes - Manage pending communities
router.get('/admin/pending', auth, admin, communityCtrl.getPendingCommunities);
router.get('/admin/all', auth, admin, communityCtrl.getAllCommunities);
router.put('/admin/:communityId/approve', auth, admin, communityCtrl.approveCommunity);
router.put('/admin/:communityId/reject', auth, admin, communityCtrl.rejectCommunity);
router.delete('/admin/:communityId', auth, admin, communityCtrl.deleteCommunity);

// User routes - Public endpoints
router.get('/', communityCtrl.getAllApprovedCommunities);
router.get('/my', auth, communityCtrl.getUserCommunities);
router.post('/', auth, communityCtrl.createCommunityUser);
router.get('/:communityId', communityCtrl.getCommunityDetail);
router.get('/:communityId/members', communityCtrl.getCommunityMemberDetails);
router.post('/:communityId/join', auth, communityCtrl.joinCommunity);
router.post('/:communityId/leave', auth, communityCtrl.leaveCommunity);
router.put('/:communityId', auth, communityCtrl.updateCommunity);
router.delete('/:communityId', auth, communityCtrl.deleteCommunity);

module.exports = router;
