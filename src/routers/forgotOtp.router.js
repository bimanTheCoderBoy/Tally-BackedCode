
import express from 'express'
import { forgotPassword, verifyOtp } from '../controllers/otp.controller.js';
const router = express.Router();


router.post('/forgot-password', forgotPassword );
router.post('/verify-otp', verifyOtp );


export default router;