
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import LoginUser from '../models/LoginUser.model.js'
import Otp from '../models/Otp.model.js'
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js';

// Setup email transporter, 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // secure: true,
    port: 465,
    auth: {
        user: 'pukutusputuskutus@gmail.com',
        pass: 'cidz ekcx uehx btnm'
    }
});

// Forgot Password Controller
const forgotPassword = AsyncHandler(async (req, res, next) => {


    // getting the user email from frontend
    const { email } = req.body;


    // Check if user exists
    const user = await LoginUser.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiResponse({}, "User not found"))
    }


    // Generate OTP
    const otp = crypto.randomInt(100000, 999999); // Generates a 6-digit number
    // const expiresAt = Date.now() + 2 * 60 * 1000; // OTP valid for 2 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes


    // Save OTP and expiration to database
    await Otp.create({ email, otp, expiresAt });
    


    // Send OTP via email
    const mailOptions = {
        from: 'trisha.ghosh@gmail.com',
        to: email,
        subject: 'Your OTP for Password Reset',
        // text: `Your OTP is ${otp}. It is valid for 2 minutes.`
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    };
    await transporter.sendMail(mailOptions);


    res.status(200).json(new ApiResponse({}, "OTP sent to email"))
});

// Verify OTP and allow password reset
const verifyOtp = AsyncHandler(async (req, res, next) => {


    // getting the otp from frontend
    const { email, otp, newPassword } = req.body;


    // Check if OTP is valid
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        return res.status(400).json(new ApiResponse({}, "Invalid or expired OTP"))
    }


    // checking the existance of the user
    const user = await LoginUser.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiResponse({}, "User not found"))
    }


    // Update user password
    user.password = newPassword;
    await user.save();


    // Delete OTP record
    await Otp.deleteOne({ email, otp });


    // sending responce back to fornt end
    res.status(200).json(new ApiResponse({}, "Password updated successfully"))
});


export { forgotPassword, verifyOtp }