
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import authCheckMiddleware from '../middlewares/auth.check.middleware.js';
const router = express.Router();
import recommendation from '../controllers/recommendation.controller.js';


router.post('/get-recommendation', authCheckMiddleware, recommendation);


export default router;