const express = require('express');
const router = express.Router();
const Logs = require('../models/Logs');
const { protect } = require('../middleware/auth');

// @route   GET /api/logs
// @desc    Get all action logs for the user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const logs = await Logs.find({ userId: req.user })
            .populate('entityId', 'title category') // Populate decision details
            .sort({ timestamp: -1 })
            .limit(50); // Fetch the 50 most recent actions
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
