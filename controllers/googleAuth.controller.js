const firebaseService = require('../services/firebase.service');
const jwt = require('jsonwebtoken');

exports.googleLogin = async (req, res) => {
    try {
        console.log("Incoming Google Login Request:", req.body);

        const { idToken } = req.body;
        
        // --- CHANGE HERE ---
        // req.app.get ki jagah tenant middleware se models lein
        const { User } = req.tenantModels; 

        // Check 1: Token verification
        if (!idToken) {
            return res.status(400).json({ 
                success: false, 
                message: "400 Error: idToken is missing in request body" 
            });
        }

        // Check 2: Firebase verification
        let googleUser;
        try {
            googleUser = await firebaseService.verifyGoogleToken(idToken);
        } catch (firebaseErr) {
            return res.status(401).json({ 
                success: false, 
                message: "Firebase verification failed", 
                error: firebaseErr.message 
            });
        }

        const { email, name, picture, uid } = googleUser;

        // User ko find ya create karein (Sahi Client DB mein)
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                googleId: uid,
                avatar: picture,
                isVerified: true,
                auth_provider: 'google' // Apne schema ke hisab se provider set karein
            });
        }

        // JWT Token generate karein
        const token = jwt.sign(
            { id: user._id, module: 'ty58d' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        return res.status(200).json({ 
            success: true, 
            token, 
            user,
            message: "Login successful (Module: ty58d)"
        });

    } catch (err) {
        console.error("Internal Server Error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};