const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, deleteAccount, uploadProfileImage } = require('../controllers/profileController');
const { upload } = require('../config/cloudinary');

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

// The multer middleware 'upload.single("image")' intercepts the incoming file named "image"
router.post('/profile/upload-image', protect, upload.single('image'), uploadProfileImage);


router.delete('/account', protect, deleteAccount);

module.exports = router;
