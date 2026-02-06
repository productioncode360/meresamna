const mongoose = require('mongoose');

const connections = {}; 
const modelsCache = {}; 

const getModels = async (serviceName) => {
    // 1. Base URI ko dhyan se uthayein
    const baseUri = process.env.MAIN_DB_URI;
    const engineDbName = process.env.ENGINE_DB_NAME || 'engine_core_privateer';

    if (!baseUri) throw new Error("MAIN_DB_URI is missing in .env");

    // 2. Engine DB Connection
    if (!connections['engine']) {
        // Atlas ke liye options specify karna behtar hota hai
        connections['engine'] = await mongoose.createConnection(baseUri, {
            dbName: engineDbName, // Database name yahan specify karein, URI modify karne ki zarurat nahi
        }).asPromise();
        console.log(`🛡️  Engine DB Connected: [${engineDbName}]`);
    }
    const engineConn = connections['engine'];

    // 3. Client DB Connection
    let clientConn = engineConn; 
    if (serviceName !== 'engine-core') {
        if (!connections[serviceName]) {
            const clientDbName = `${serviceName}_db`;
            connections[serviceName] = await mongoose.createConnection(baseUri, {
                dbName: clientDbName,
            }).asPromise();
            console.log(`🍃 New Client DB Connected: [${clientDbName}]`);
        }
        clientConn = connections[serviceName];
    }

    // 4. Models Cache
    if (!modelsCache[serviceName]) {
        const UserSchema = require('../models/User');
        const OtpLogSchema = require('../models/OtpLog');
        const ClientSchema = require('../models/Client');

        modelsCache[serviceName] = {
            User: clientConn.model('User', UserSchema),
            OtpLog: engineConn.model('OtpLog', OtpLogSchema),
            Client: engineConn.model('Client', ClientSchema)
        };
    }

    return modelsCache[serviceName];
};

module.exports = getModels;
