
import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import {sendOtp, registerUser, loginUser, getUser, logoutUser, updatePassword,getLeaderboard,getPerformence,getBadges} from '../controllers/LoginUser.controller.js'
const router = express.Router();


router.post('/send-otp', sendOtp)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/get-user', authMiddleware, getUser)
router.post('/logout', authMiddleware, logoutUser)
router.put('/update-password', authMiddleware, updatePassword)
router.get('/get-leaderboard', authMiddleware, getLeaderboard)
router.get('/get-performence', authMiddleware, getPerformence)
router.get('/get-badges', authMiddleware, getBadges)


export default router;