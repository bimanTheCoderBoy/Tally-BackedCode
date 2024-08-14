
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js'
import LoginUser from '../models/LoginUser.model.js';
import jwt from "jsonwebtoken"


// register 
const registerUser = AsyncHandler(async (req, res, next) => {


    //get user Details from frontend
    const { username, password, email, fullName } = req.body


    //field validation ( if blank or not )
    if ([password, fullName, email, username].some((field) => field.trim() === "")) {
        throw new ApiError(400, "Invalid Api Field")
    }


    //allready exists check
    const existedUser = await LoginUser.findOne({
        $or: [{ email }, { username }]
    });
    if (existedUser) {
        throw new ApiError(409, "User Already Exists")
    }


    //create user object
    const newUser = await LoginUser.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
    })


    // save to thr db
    await newUser.save();


    //remove password from response
    const createdUser = await LoginUser.findById(newUser._id).select("-password")


    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Some thing went wrong while creating a new user")
    }


    //sending response back to the front-end
    res.status(201).json(
        new ApiResponse(
            createdUser,
            "User created successfully"
        )
    )
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


export { registerUser, loginUser, logoutUser, updatePassword }