
import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import {sendOtp, registerUser,loginUser,logoutUser,updatePassword} from '../controllers/LoginUser.controller.js'
const router = express.Router();


router.post('/send-otp', sendOtp)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authMiddleware, logoutUser)
router.put('/update-password', authMiddleware, updatePassword)


export default router;