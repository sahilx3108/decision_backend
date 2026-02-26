const User = require('../models/User');
const DecisionEntity = require('../models/DecisionEntity');
const Logs = require('../models/Logs');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { profileImage, education, skills, careerGoals } = req.body;

        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (profileImage !== undefined) user.profileImage = profileImage;
        if (education !== undefined) user.education = education;
        if (skills !== undefined) user.skills = skills;
        if (careerGoals !== undefined) user.careerGoals = careerGoals;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
            education: updatedUser.education,
            skills: updatedUser.skills,
            careerGoals: updatedUser.careerGoals
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/user/account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all decisions and logs associated with the user
        await DecisionEntity.deleteMany({ userId: req.user });
        await Logs.deleteMany({ userId: req.user });

        // Delete the user account
        await user.deleteOne();

        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error deleting account' });
    }
};

// @desc    Upload user profile image
// @route   POST /api/user/profile/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // The image is already uploaded to Cloudinary by multer-storage-cloudinary
        // The secure URL is available in req.file.path
        user.profileImage = req.file.path;
        await user.save();

        res.json({
            message: 'Image uploaded successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Server error uploading image' });
    }
};
