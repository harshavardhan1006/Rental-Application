const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/:id', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
