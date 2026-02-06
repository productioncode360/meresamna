const mongoose = require('mongoose');

const connections = {}; // Connections cache karne ke liye
const modelsCache = {}; // Models cache karne ke liye

const getModels = async (serviceName) => {
    const mainUri = process.env.MAIN_DB_URI || 'mongodb://127.0.0.1:27017';
    const engineDbName = process.env.ENGINE_DB_NAME || 'engine_core_private';

    // 1. Engine DB Connection (Master Database)
    if (!connections['engine']) {
        connections['engine'] = await mongoose.createConnection(`${mainUri}/${engineDbName}`).asPromise();
        console.log(`🛡️  Engine DB Connected: [${engineDbName}]`);
    }
    const engineConn = connections['engine'];

    // 2. Client DB Connection (Dynamic based on Client-ID)
    // Agar hum 'engine-core' mang rahe hain, toh sirf engineConn hi use hoga
    let clientConn = engineConn; 
    if (serviceName !== 'engine-core') {
        if (!connections[serviceName]) {
            const clientDbName = `${serviceName}_db`;
            connections[serviceName] = await mongoose.createConnection(`${mainUri}/${clientDbName}`).asPromise();
            console.log(`🍃 New Client DB Connected: [${clientDbName}]`);
        }
        clientConn = connections[serviceName];
    }

    // 3. Models load karein (Cache management)
    if (!modelsCache[serviceName]) {
        const UserSchema = require('../models/User');
        const OtpLogSchema = require('../models/OtpLog');
        const ClientSchema = require('../models/Client'); // Naya Client Schema

        modelsCache[serviceName] = {
            // User hamesha Client ke specific DB mein jayega
            User: clientConn.model('User', UserSchema),
            
            // OtpLog hamesha Engine (Master) DB mein rahega
            OtpLog: engineConn.model('OtpLog', OtpLogSchema),
            
            // Client registration data hamesha Engine DB mein rahega
            Client: engineConn.model('Client', ClientSchema)
        };
    }

    return modelsCache[serviceName];
};

module.exports = getModels;