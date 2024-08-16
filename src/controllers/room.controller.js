import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import LoginUser from "../models/LoginUser.model.js";
export const createRoom=AsyncHandler(async(req, res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError("user not found", 401);
    }
    const {roomName, roomId}=req.body;
    if([roomName, roomId].some((x)=>x=="")){
        res.status(401).json({
            message:"user not found",
            success:false});
    }
    const newUser=await LoginUser.findByIdAndUpdate(user._id,{room:{roomName, roomId}});
    if(!newUser){
        res.status(400).json({
            message:"room creation failed",
            success:false});
    }
    res.status(200).json({
        message:"room created successfully",
        success:true});

})

export const getRoom=AsyncHandler(async(req, res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError("user not found", 401);
    }
    const room=await LoginUser.findById(user._id).select("room");
    if(!room){
        res.status(400).json({
            message:"room not found",
            success:false});
    }
    res.status(200).json({
        room,
        success:true});
})