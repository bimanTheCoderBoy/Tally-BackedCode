
import ApiError from '../utils/ApiError.js'
import AsyncHandler from '../utils/AsyncHandler.js'
import LoginUser from '../models/LoginUser.model.js'
import jwt from "jsonwebtoken"


const authCheckMiddleware = AsyncHandler(async (req, res, next)=>{


    // Retrieve token from cookies or Authorization header
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    if(!token)
    {
        req.auth=false;
        next();
        // throw new ApiError(401,"Unauthorized user")
        return;
    }
    

    //verify token
    const tokenData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


    //checking and getting user
    const user=await LoginUser.findById(tokenData?._id)
    if(!user)
    {
        req.auth=false;
        next();
        return; 
    }


    //adding user to request object
    req.user=user
    // console.log(req.user);
    req.auth=true;
    next()
    return;
})


export default authCheckMiddleware