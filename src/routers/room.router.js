import express from "express";
const router=express.Router()
import {createRoom,getRoom} from "../controllers/room.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js";
router.post("/create-room",authMiddleware,createRoom);
router.get("/get-room",authMiddleware,getRoom)
export default router