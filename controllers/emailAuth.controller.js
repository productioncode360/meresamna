const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../services/mail.service');
const otpService = require('../services/otp.service');

// --- REGISTER (v34x) ---
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Tenant Middleware se models le rahe hain
        const { User } = req.tenantModels; 

        const existingUser = await User.findOne({ email, auth_provider: 'nodemailer' });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists (Manual)" });

        const hashedPass = await bcrypt.hash(password, 10);
        await User.create({ 
            email, 
            password: hashedPass, 
            name, 
            auth_provider: 'nodemailer',
            isVerified: false 
        });

        res.status(201).json({ success: true, message: "Registered (v34x). Please verify OTP." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- LOGIN (v34x) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { User } = req.tenantModels;

        const user = await User.findOne({ email, auth_provider: 'nodemailer' });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Verify OTP first" });
        }

        const token = jwt.sign(
            { id: user._id, module: 'v34x' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- SEND OTP (v34x) ---
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const { OtpLog } = req.tenantModels; // Yeh Engine DB se connected hai via db.js

        const otp = otpService.generateOTP();
        
        // OTP save ya update karein
        await OtpLog.findOneAndUpdate(
            { email }, 
            { otp, createdAt: new Date() }, 
            { upsert: true, new: true }
        );

        // Email bhejein
        await mailService.sendOTP(email, otp);

        res.status(200).json({ success: true, message: "OTP sent (v34x)" });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

// --- VERIFY OTP (v34x) ---
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const { User, OtpLog } = req.tenantModels;

        // OTP check karein
        const record = await OtpLog.findOne({ email, otp });
        if (!record) return res.status(400).json({ success: false, message: "Invalid OTP" });

        // User ko verify karein
        const user = await User.findOneAndUpdate(
            { email }, 
            { isVerified: true }, 
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const token = jwt.sign(
            { id: user._id, module: 'v34x' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Verify hone ke baad OTP delete kar sakte hain (Optional)
        await OtpLog.deleteOne({ email });

        res.status(200).json({ success: true, token, user });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

// --- RESET PASSWORD (v34x) ---
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const { User, OtpLog } = req.tenantModels;

        const record = await OtpLog.findOne({ email, otp });
        if (!record) return res.status(400).json({ success: false, message: "Invalid OTP" });

        const hashedPass = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate(
            { email }, 
            { password: hashedPass, isVerified: true }
        );

        res.status(200).json({ success: true, message: "Password reset successful (v34x)" });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

// --- LOGOUT ---
exports.logout = async (req, res) => {
    try {
        const path = req.originalUrl;
        let moduleType = "General";
        
        if (path.includes('v34x')) moduleType = "Nodemailer (Manual)";
        else if (path.includes('ty58d')) moduleType = "Firebase (Google)";
        else if (path.includes('hm99k')) moduleType = "Hybrid System";

        res.status(200).json({ 
            success: true, 
            message: `${moduleType} logged out successfully. Session cleared.` 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};