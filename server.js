const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const getModels = require('./config/db'); // 1. db.js ko import karein

// Imports
const tenantMiddleware = require('./middlewares/tenant.middleware');
const authRoutes = require('./routes/auth.routes');
const adminCtrl = require('./controllers/admin.controller');

dotenv.config();
const app = express(); 

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.post('/api/admin/register-client', adminCtrl.createClient);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/api/auth', tenantMiddleware, authRoutes());

const PORT = process.env.PORT || 5000;

// 2. Listen function ko 'async' banayein aur DB call karein
app.listen(PORT, async () => {
    console.log(`🚀 SERVER RUNNING ON PORT: ${PORT}`);
    
    try {
        // Yeh line Master DB (engine-core) ko connect kar degi startup par hi
        await getModels('engine-core'); 
        console.log("📡 Master Database: Checking Status... OK");
    } catch (err) {
        console.error("❌ Startup Database Error:", err.message);
    }
});