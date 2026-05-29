const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/friendController');

router.get('/', auth, ctrl.getFriends);
router.get('/requests', auth, ctrl.getRequests);
router.post('/request/:userId', auth, ctrl.sendRequest);
router.put('/request/:id/accept', auth, ctrl.acceptRequest);
router.put('/request/:id/reject', auth, ctrl.rejectRequest);
router.delete('/:userId', auth, ctrl.removeFriend);

module.exports = router;
