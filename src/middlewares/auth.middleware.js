
import ApiError from '../utils/ApiError.js'
import AsyncHandler from '../utils/AsyncHandler.js'
import LoginUser from '../models/LoginUser.model.js'
import jwt from "jsonwebtoken"


const authMiddleware = AsyncHandler(async (req, res, next)=>{


    // Retrieve token from cookies or Authorization header
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    if(!token)
    {
        throw new ApiError(401,"Unauthorized user")
    }
    

    //verify token
    const tokenData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


    //checking and getting user
    const user=await LoginUser.findById(tokenData?._id)
    if(!user)
    {
        throw new ApiError(400,"Invalid credentials")
    }


    //adding user to request object
    req.user=user
    next()
})


export default authMiddleware