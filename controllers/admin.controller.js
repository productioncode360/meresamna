const crypto = require('crypto');
const getModels = require('../config/db');

exports.createClient = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // 1. Engine DB se connect karein
        const { OtpLog } = await getModels('engine-core'); 
        const ClientModel = OtpLog.db.model('Client', require('../models/Client'));

        // 2. Check if client exists
        const existing = await ClientModel.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        // 3. Unique Client ID generate karein (e.g., auth_7k2j9...)
        const clientId = `auth_${crypto.randomBytes(6).toString('hex')}`;

        const newClient = await ClientModel.create({ name, email, clientId });

        res.status(201).json({
            success: true,
            message: "Client Registered Successfully!",
            data: {
                name: newClient.name,
                clientId: newClient.clientId // Ye unhe dikhana hai
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};