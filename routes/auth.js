const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                education: user.education,
                skills: user.skills,
                careerGoals: user.careerGoals,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                education: user.education,
                skills: user.skills,
                careerGoals: user.careerGoals,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/google
// @desc    Auth with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login' }),
    (req, res) => {
        // Successful authentication
        const token = generateToken(req.user._id);
        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    }
);

// @route   GET /api/auth/github
// @desc    Auth with GitHub
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub auth callback
// @access  Public
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: process.env.CLIENT_URL + '/login' }),
    (req, res) => {
        // Successful authentication
        const token = generateToken(req.user._id);
        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
