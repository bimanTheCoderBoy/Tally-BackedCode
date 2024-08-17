import Question from "../models/Questions.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { runTestCaseJava } from "../utils/runJavaCode.js";
import { runPythonTestCase } from "../utils/runPythonCode.js";
import LoginUser from "../models/LoginUser.model.js";
import Submission from '../models/Submission.model.js';
// Get all questions
export const getAllQuestions = AsyncHandler(async (req, res) => {
  // get question tittle and dificulty level only as a form of an array of objects

  const questions = await Question.find().select("title difficulty");

  // If no questions are found, return an empty array, at first when no question is created
  if (!questions.length) {
    return res
      .status(200)
      .json({ message: "Unable to fetch questions", success: false });
  }

  res.status(200).json({ questions, success: true });
  // res.status(200).json({ message: 'test' });
});

// Get a single question by ID
export const getQuestionById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid question ID format", success: false });
  }

  const question = await Question.findById(id);
  if (question) {
    res.status(200).json({ question, success: true });
  } else {
    res.status(404).json({ message: "Question not found", success: false });
  }
});

// Add a new question
export const addQuestion = AsyncHandler(async (req, res) => {
  // console.log("test");
  const { title, description, difficulty, constraints, testCases, author } =
    req.body;

  // console.log(res.body);
  // console.log(title);
  // console.log(description);
  // console.log(difficulty);
  // console.log(constraints);
  // console.log(testCases);
  // console.log(author);

  if (
    !title ||
    !description ||
    !difficulty ||
    !constraints ||
    !testCases ||
    !author
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate that difficulty is one of the allowed values
  const allowedDifficulties = ["Easy", "Medium", "Hard"];
  if (!allowedDifficulties.includes(difficulty)) {
    return res.status(400).json({
      message: `Invalid difficulty level. Choose from: ${allowedDifficulties.join(
        ", "
      )}`,
    });
  }

  const newQuestion = new Question({
    title,
    description,
    difficulty,
    constraints,
    testCases,
    author,
  });

  await newQuestion.save();

  console.log("done");
  res.status(201).json({ success: true });
});

export const getDiscussions = AsyncHandler(async (req,res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({message: 'Missing Question ID',success: false});
  }
  const question = await Question.findById(id);
  const discussions = question.discussions;
  res.status(200).json({ discussions: discussions,success: true});
});
export const putDiscussions = AsyncHandler(async (req,res) => {
  if(!req.auth){
    res.status(401).json({message: 'You must be logged in to access this page',success: false});
    return;
  }
  // const userid=req.user._id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({message: 'Missing Question ID',success: false});
  }

  const { discussion } = req.body;
  if (!discussion) {
    res.status(400).json({message: 'discussion required',success: false});
  }
  const question = await Question.findByIdAndUpdate(id, {
    $push:{discussions:{ discussion: discussion, username: req.user.username,time:Date.now()}},
  });
  if (!question) {
    res.status(400).json({message: 'message required',success: false});
  }
  res.status(200).json({ message: "Discussion added successfully",success: true});
});

// test code section
// submission
export const runTestCase = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language, code, input, className } = req.body;
  // console.log(language, code, input);

  if (!language || !code) {
    throw new ApiError("Missing required fields", 400);
  }
  if (!id) {
    throw new ApiError("Missing ID", 400);
  }

  const question = await Question.findById(id);

  if (!question) {
    throw new ApiError("Question not found", 404);
  }

  const testCases = question.testCases;
  let result = [];
  switch (language) {
    case "java":
      result = await runTestCaseJava(code, className, testCases);
      break;
    case "python":
      result = await runPythonTestCase(code, testCases);
      break; 
    case "java":
      output = await runJavaCode(code, input, className);
      break;
    case "java":
      output = await runJavaCode(code, input, className);
      break;
    default:
      throw new ApiError("Unsupported language", 404);
  }

  // if all test cases passed then push that qid to the user specified field
  // console.log(req.auth)
  if (req.auth) {


    let allPassed = true;
    for (let i = 0; i < result.length; i++) {
      if (result[i].status == "failed") {
        allPassed = false;
        break;
      }
    }
    console.log(allPassed);
    if (allPassed) {
      await LoginUser.findByIdAndUpdate(req.user._id, {
        $push: { questionSolved: id }
      });
    }


    // Create a new submission
    const newSubmission = new Submission({
      userId: req.user._id,
      questionId: id,
      language,
      code,
      accepted:allPassed
    });

    // Save the submission to the database
    await newSubmission.save();

    
  }

  res.status(200).json({ result, success: true });
});

export const getSubmissions=AsyncHandler(async(req,res) => {
    if(!req.auth){
      res.status(401).json({ message:"You Have To Login First To Get This Veiw", success:false});
      return
    }
    const userId=req.user._id;
    const{qid}=req.params;
    if(!qid){
      res.status(400).json({ message:"Missing Question ID", success:false});
      return
    }
    const submissions=await Submission.find({userId,questionId:qid}).sort({createdAt: -1}).select("language code createdAt accepted");
    res.status(200).json({ submissions, success:true});
})