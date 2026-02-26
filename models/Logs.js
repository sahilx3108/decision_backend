const mongoose = require('mongoose');

const LogsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DecisionEntity',
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Logs', LogsSchema);
