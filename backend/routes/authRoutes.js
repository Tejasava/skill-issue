const express = require('express');
const router = express.Router();
const { register, login, adminLogin, me } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', auth, me);

module.exports = router;
