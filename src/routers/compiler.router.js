import express from 'express';
const router=express.Router();
import { executeCode } from '../controllers/compiler.controller.js';

router.post("/execute",executeCode)



export default router