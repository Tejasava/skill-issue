const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const chat = require('../controllers/chatController');

router.post('/conversations', auth, chat.startOrGetConversation);
router.get('/conversations', auth, chat.getConversations);
router.get('/conversations/:id/messages', auth, chat.getMessages);
router.post('/conversations/:id/messages', auth, chat.sendMessage);

module.exports = router;
