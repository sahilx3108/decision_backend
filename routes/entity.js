const express = require('express');
const router = express.Router();
const DecisionEntity = require('../models/DecisionEntity');
const Logs = require('../models/Logs');
const { protect } = require('../middleware/auth');

// @route   POST /api/entity
// @desc    Create a new decision entity
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, category, status, priority } = req.body;

        const newDecision = await DecisionEntity.create({
            userId: req.user,
            title,
            description,
            category,
            status: status || 'Pending',
            priority: priority || 'Medium',
        });

        // Log the creation action
        await Logs.create({
            userId: req.user,
            entityId: newDecision._id,
            action: 'CREATED_DECISION'
        });

        res.status(201).json(newDecision);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/entity
// @desc    Get all decisions for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const decisions = await DecisionEntity.find({ userId: req.user }).sort({ createdAt: -1 });
        res.json(decisions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/entity/:id
// @desc    Update a decision entity
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let decision = await DecisionEntity.findById(req.params.id);

        if (!decision) {
            return res.status(404).json({ message: 'Decision not found' });
        }

        // Ensure user owns this decision
        if (decision.userId.toString() !== req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        decision = await DecisionEntity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // Log the update action
        await Logs.create({
            userId: req.user,
            entityId: decision._id,
            action: 'UPDATED_DECISION'
        });

        res.json(decision);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/entity/:id
// @desc    Delete a decision entity
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const decision = await DecisionEntity.findById(req.params.id);

        if (!decision) {
            return res.status(404).json({ message: 'Decision not found' });
        }

        // Ensure user owns this decision
        if (decision.userId.toString() !== req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await decision.deleteOne();

        // Log the deletion action
        await Logs.create({
            userId: req.user,
            entityId: req.params.id,
            action: 'DELETED_DECISION'
        });

        res.json({ message: 'Decision removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
