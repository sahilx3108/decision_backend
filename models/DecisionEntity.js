const mongoose = require('mongoose');

const DecisionEntitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'In-progress', 'Completed'],
        default: 'Pending',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DecisionEntity', DecisionEntitySchema);
