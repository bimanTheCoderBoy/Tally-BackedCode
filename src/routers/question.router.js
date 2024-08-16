import express from 'express';
import { getAllQuestions, addQuestion, getQuestionById,runTestCase,getDiscussions} from '../controllers/question.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authCheckMiddleware from '../middlewares/auth.check.middleware.js';

const router = express.Router();

router.get('/all', getAllQuestions);

router.get('/:id', getQuestionById);

router.post('/add', addQuestion);
router.post('/run/:id',runTestCase );
router.get('getdiscuss/:id',authCheckMiddleware, getDiscussions);
export default router;
