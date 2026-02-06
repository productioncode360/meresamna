const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const cors = require('cors');
const connectDB = require('./db');

module.exports = async (clientDir, routes) => {
    const clientEnv = path.resolve(clientDir, '.env');
    const engineEnv = path.resolve(__dirname, '../.env');

    if (fs.existsSync(clientEnv)) dotenv.config({ path: clientEnv });
    if (fs.existsSync(engineEnv)) dotenv.config({ path: engineEnv, override: true });

    const serviceName = path.basename(clientDir);
    const { models, clientConn } = await connectDB(serviceName);

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Injection for middlewares and controllers
    app.set('models', models);
    app.set('clientConn', clientConn);

    if (routes) app.use('/api/auth', routes(models));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n===============================================`);
        console.log(`🚀 MASTER ENGINE ACTIVE | PORT: ${PORT}`);
        console.log(`📡 SERVICE      : ${serviceName.toUpperCase()}`);
        console.log(`===============================================\n`);
    });

    return { app, models };
};