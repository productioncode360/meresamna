// client-app/server.js

// 1. Path module import karo taaki confusion na ho
const path = require('path');

// 2. Client ki local .env load karo (Ye node_modules engine-core se uthayega)
require("dotenv").config(); 

// 3. Engine ki files ko import karo (Ab sirf ek level piche jana hai)
const startApp = require("../config/engine"); 
const authRoutes = require("../routes/auth.routes"); 

const startClientServer = async () => {
    try {
        // __dirname matlab client-app folder ka path
        const { app } = await startApp(__dirname, authRoutes);

        console.log("✅ Engine Inside: Client Integrated Successfully.");
        
    } catch (error) {
        console.error("❌ Startup Error:", error.message);
        process.exit(1);
    }
};

startClientServer();