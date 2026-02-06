const getModels = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        const clientId = req.headers['x-client-id'];
        if (!clientId) return res.status(401).json({ success: false, message: "Client ID required" });

        // 1. Engine DB se client verify karein
        const { OtpLog } = await getModels('engine-core');
        const ClientModel = OtpLog.db.model('Client', require('../models/Client'));

        const clientExists = await ClientModel.findOne({ clientId, status: 'active' });

        if (!clientExists) {
            return res.status(403).json({ success: false, message: "Invalid or Inactive Client ID" });
        }

        // 2. Agar valid hai, toh request ko aage bhejein
        req.tenantModels = await getModels(clientId.toLowerCase());
        next();
    } catch (error) {
        res.status(500).json({ success: false, error: "Authentication Error" });
    }
};