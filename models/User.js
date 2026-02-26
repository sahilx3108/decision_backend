const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false, // Optional for OAuth
    },
    googleId: {
        type: String,
    },
    githubId: {
        type: String,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local',
    },
    profileImage: {
        type: String, // Store as Base64 string
        default: '',
    },
    education: {
        type: String,
        default: '',
    },
    skills: {
        type: String,
        default: '',
    },
    careerGoals: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash the password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
