const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String }, // Yeh field hona zaroori hai hash save karne ke liye
    googleId: String,
    avatar: String, // Google login ke liye optional
    isVerified: { type: Boolean, default: false },
    provider: { type: String, default: 'email' } // 'email' ya 'google'
}, { timestamps: true });