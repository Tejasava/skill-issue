const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const userCtrl = require('../controllers/userController');

router.get('/', userCtrl.getAllUsers);
router.get('/:id', userCtrl.getUserById);
router.put('/profile', auth, upload.single('avatar'), userCtrl.updateProfile);
router.post('/upload-work', auth, upload.single('image'), userCtrl.uploadWork);
router.delete('/work/:workId', auth, userCtrl.deleteWork);

module.exports = router;
