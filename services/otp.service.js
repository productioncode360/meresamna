const otpStore = new Map(); // Temporary memory storage for OTPs

/**
 * OTP Limit Checker & Counter
 * Har deviceId ke liye daily limit check karta hai
 */
const isLimitExceeded = async (deviceId, OtpLog, limit = 5) => {
    if (!deviceId) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await OtpLog.findOne({ deviceId });

    // Agar device pehli baar aaya hai
    if (!log) {
        log = new OtpLog({ deviceId, count: 1, lastSent: Date.now() });
        await log.save();
        return false;
    }

    // Daily Reset Logic: Agar lastSent purana din hai toh count 1 kar do
    const lastSentDate = new Date(log.lastSent);
    lastSentDate.setHours(0, 0, 0, 0);

    if (lastSentDate.getTime() < today.getTime()) {
        log.count = 1;
        log.lastSent = Date.now();
        await log.save();
        return false;
    }

    // Limit Check
    if (log.count >= limit) return true;

    // Count Badhao (Limit consume karo)
    log.count += 1;
    log.lastSent = Date.now();
    await log.save();
    return false;
};

/**
 * Generates OTP and stores it in memory
 */
const generateOTP = (email, data, ttl = 300000) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Memory mein save (Default: 5 mins)
    otpStore.set(email, { otp, ...data, expires: Date.now() + ttl });
    return otp;
};

/**
 * Verifies submitted OTP against stored data
 */
const verifyOTP = (email, otp) => {
    const data = otpStore.get(email);
    if (!data || data.otp !== otp || data.expires < Date.now()) {
        return null;
    }
    otpStore.delete(email); // Verify hone ke baad delete kar do
    return data;
};

module.exports = { isLimitExceeded, generateOTP, verifyOTP };