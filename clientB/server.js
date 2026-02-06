const path = require('path');
const startEngine = require('../config/engine'); 
const authRoutes = require('../routes/auth.routes'); 

const startClientB = async () => {
    try {
        console.log("🛠️  Initializing ClientB with Suffix-based Routes...");

        // 1. Engine start karein
        const { app, models } = await startEngine(__dirname);

        // 2. Routes ko models ke saath initialize karke mount karein
        // Hum base path '/api/auth' hi rakhenge, 
        // par endpoints ab /register_v34x jaise honge
        if (models && typeof authRoutes === 'function') {
            app.use('/api/auth', authRoutes(models));
            console.log("✅ Auth Routes Mounted: /api/auth/[endpoint]_[suffix]");
        }

        app.get('/api/client-b/status', (req, res) => {
            res.json({ success: true, message: "ClientB Hybrid System is Live" });
        });

        console.log("🚀 ClientB Server is running on Port 5005");

    } catch (err) {
        console.error("❌ Startup Failed:", err.message);
        process.exit(1);
    }
};

startClientB();