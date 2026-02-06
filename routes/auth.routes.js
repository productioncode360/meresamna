const express = require('express');
const router = express.Router();
const emailCtrl = require('../controllers/emailAuth.controller');
const googleCtrl = require('../controllers/googleAuth.controller');
const otpRateLimiter = require('../middlewares/otpRateLimiter');

/**
 * AUTH ROUTES SYSTEM
 * Render par deploy hone ke baad, 'tenantMiddleware' pehle chalega 
 * jo req.tenantModels set kar dega.
 */
module.exports = () => {
    
    // --- 1. Nodemailer Module (Suffix: v34x) ---
    // In sabhi routes mein emailCtrl automatically req.tenantModels use karega
    router.post('/register_v34x', emailCtrl.register);
    router.post('/login_v34x', emailCtrl.login);
    router.post('/send-otp_v34x', otpRateLimiter, emailCtrl.sendOtp);
    router.post('/verify-otp_v34x', emailCtrl.verifyOtp);
    router.post('/reset-password_v34x', emailCtrl.resetPassword);
    router.post('/logout_v34x', emailCtrl.logout);

    // --- 2. Google/Firebase Module (Suffix: ty58d) ---
    router.post('/google-login_ty58d', googleCtrl.googleLogin);
    router.post('/logout_ty58d', emailCtrl.logout);

    // --- 3. Hybrid Module (Suffix: hm99k) ---
    router.post('/logout_hm99k', emailCtrl.logout);

    return router;
};