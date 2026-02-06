module.exports = async (req, res, next) => {
    const models = req.app.get('models');
    if (!models) return next();
    const { OtpLog } = models;
    const { email } = req.body;

    if (!email) return next();
    const lastOtp = await OtpLog.findOne({ email });
    if (lastOtp && (Date.now() - new Date(lastOtp.createdAt).getTime() < 60000)) {
        return res.status(429).json({ message: "Please wait 1 minute" });
    }
    next();
};