
import express from 'express';
import { getAllQuestions, addQuestion, getQuestionById,runTestCase,getDiscussions,getSubmissions,putDiscussions} from '../controllers/question.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authCheckMiddleware from '../middlewares/auth.check.middleware.js';

const router = express.Router();

router.get('/all', getAllQuestions);

router.get('/:id', getQuestionById);

router.post('/add', addQuestion);
router.post('/run/:id', authCheckMiddleware, runTestCase );
router.get('/getdiscussions/:id',authCheckMiddleware, getDiscussions);
router.post('/putdiscussion/:id',authCheckMiddleware,putDiscussions)
router.get('/getsubmissions/:qid',authCheckMiddleware,getSubmissions);
export default router;