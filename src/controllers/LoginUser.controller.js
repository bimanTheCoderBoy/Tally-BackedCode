
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js'
import nodemailer from 'nodemailer';
import Otp from '../models/Otp.model.js'
import LoginUser from '../models/LoginUser.model.js';
import jwt from "jsonwebtoken"
import crypto from 'crypto';


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


// send otp for email verification
const sendOtp = AsyncHandler(async (req, res, next) => {


    //get user Details from frontend
    const { username, password, email, fullName } = req.body


    //field validation ( if blank or not )
    if ([username, password, email, fullName].some((field) => field.trim() === "")) {
        res.status(400).json(new ApiResponse({}, "All field are required"))
    }


    // Check existed verified user
    const existedVerifiedUser = await LoginUser.findOne({
        $or: [
            { email, isVerified: true },
            { username, isVerified: true }
        ]
    });
    if (existedVerifiedUser) {
        return res.status(409).json(new ApiResponse({}, "User already exists"))
    }


    // Check existed not verified user
    const existedNotVerifiedUser = await LoginUser.findOneAndUpdate({
        $or: [
            { email, isVerified: false },
            { username, isVerified: false }
        ]},
        {
            username, // Updated username
            password,  // Updated password
            fullName // Update full name
        },
        { new: true } // Return the updated document
    );
    if (!existedNotVerifiedUser) {
        // Create user object
        const newUser = await LoginUser.create({
            fullName,
            email,
            username: username.toLowerCase(),
            password,
        });
        // Save user to the database
        await newUser.save();
    }


    // Generate OTP
    const otp = crypto.randomInt(100000, 999999); // Generates a 6-digit number
    // const expiresAt = Date.now() + 60 * 60 * 1000; // OTP valid for 2 minutes
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 10 minutes


    // Save OTP and expiration to database
    await Otp.create({ email, otp, expiresAt });


    // Send OTP via email
    const mailOptions = {
        from: 'pukutusputuskutus@gmail.com',
        to: email,
        subject: 'Your OTP for email verification',
        // text: `Your OTP is ${otp}. It is valid for 60 minutes.`
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    };
    await transporter.sendMail(mailOptions);


    // sending responce back to the user
    res.status(200).json(new ApiResponse({}, "OTP sent to email successfully for email verification"))


});


// register 
// const registerUser = AsyncHandler(async (req, res, next) => {


//     //get user Details from frontend
//     const { username, password, email, fullName } = req.body


//     //field validation ( if blank or not )
//     if ([password, fullName, email, username].some((field) => field.trim() === "")) {
//         throw new ApiError(400, "Invalid Api Field")
//     }


//     //allready exists check
//     const existedUser = await LoginUser.findOne({
//         $or: [{ email }, { username }]
//     });
//     if (existedUser) {
//         throw new ApiError(409, "User Already Exists")
//     }


//     //create user object
//     const newUser = await LoginUser.create({
//         fullName,
//         email,
//         username: username.toLowerCase(),
//         password,
//     })


//     // save to thr db
//     await newUser.save();


//     //remove password from response
//     const createdUser = await LoginUser.findById(newUser._id).select("-password")


//     //check for user creation
//     if (!createdUser) {
//         throw new ApiError(500, "Some thing went wrong while creating a new user")
//     }


//     //sending response back to the front-end
//     res.status(201).json(
//         new ApiResponse(
//             createdUser,
//             "User created successfully"
//         )
//     )
// }
// )
const registerUser = AsyncHandler(async (req, res, next) => {


    //get user Details from frontend
    const { email, otp } = req.body


    //field validation ( if blank or not )
    if ([email, otp].some((field) => field.trim() === "")) {
        return res.status(400).json(new ApiResponse({}, "All fields are required"))
    }


    // Check if OTP is valid
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        return res.status(400).json(new ApiResponse({}, "Invalid or expired OTP"))
    }


    // update isVerified to true
    // Check existed verified user
    const existedNotVerifiedUser = await LoginUser.findOne({
        email,
        isVerified: false
    });
    existedNotVerifiedUser.isVerified = true;
    await existedNotVerifiedUser.save();


    // Remove OTP record from the database
    await Otp.deleteOne({ email, otp });


    // Remove password from response
    const user = await LoginUser.findById(existedNotVerifiedUser._id).select("-password");


    // Check for user creation
    if (!user) {
        return res.status(500).json(new ApiResponse({}, "Something went wrong while creating a new user"))
    }


    // response sending back to the user
    res.status(201).json(
        new ApiResponse(
            user,
            "User created successfully"
        )
    );


}
)


// login
const loginUser = AsyncHandler(async (req, res, next) => {


    //getting user data from req.body
    const { username, email, password } = req.body;


    //username or email check
    if (!username && !email) {
        return res.status(400).json(new ApiResponse({}, "Invalid Api Field"))
    }


    //user exists check
    const user = await LoginUser.findOne({
        $or: [
            { username: username?.trim().toLowerCase() },
            { email: email?.trim().toLowerCase() }
        ]
    })
    if (!user) {
        return res.status(404).json(new ApiResponse({}, "User Not Found"))
    }


    //password correct check
    const isPasswordCorrect = await user.isPasswordCorrect(password.toString())
    if (!isPasswordCorrect) {
        return res.status(404).json(new ApiResponse({}, "Invalid Password"))
    }


    //create access token
    const accessToken = user.generateAccessToken();


    // save to our db
    await user.save({ validateBeforeSave: false });


    //send via cookie
    const options = {
        httpOnly: true,
        secure: true
    }


    //remove password from response
    const validUser = await LoginUser.findById(user._id).select("-password")


    //send back to response
    res.status(200).
        cookie("accessToken", accessToken, options).
        json(
            new ApiResponse(
                { validUser, accessToken },
                "User Logged In Successfully"
            )
        )
});


// logout
const logoutUser = AsyncHandler(async (req, res, next) => {


    const options = {
        httpOnly: true,
        secure: true
    }

    //clear the access token
    res.
        status(200)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(
                {},
                "User Logged Out Successfully"
            )
        )
});

// update password
const updatePassword = AsyncHandler(async (req, res, next) => {


    //getting user data from front end
    const { oldPassword, newPassword } = req.body
    console.log(req.body);


    // field validation ( if blank or not )
    if (!oldPassword || !newPassword) {
        return res.status(400).json(new ApiResponse({}, "Invalid Api Field"))
    }


    //getting user from db
    const user = await LoginUser.findById(req.user._id)


    // user existance check
    if (!user) {
        return res.status(404).json(new ApiResponse({}, "User Not Found"))

    }


    //password correct check
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword.toString())
    if (!isPasswordCorrect) {
        return res.status(401).json(new ApiResponse({}, "Invalid Password"))
    }


    //updating password
    user.password = newPassword


    // save to our db
    await user.save({ validateBeforeSave: false });


    // sending the responce back
    res.status(200).json(new ApiResponse({}, "password updated successfully"))
});


export { sendOtp, registerUser, loginUser, logoutUser, updatePassword }