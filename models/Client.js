const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    clientId: { type: String, required: true, unique: true }, // Ye unki API Key hogi
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = ClientSchema;