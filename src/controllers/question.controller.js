import Question from "../models/Questions.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { runTestCaseJava } from "../utils/runJavaCode.js";
import { runPythonTestCase } from "../utils/runPythonCode.js";
import fs from "fs";
import { loginUser } from "./LoginUser.controller.js";
import LoginUser from "../models/LoginUser.model.js";
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

export const getDiscussions = AsyncHandler(async () => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError("Missing ID", 400);
  }
  const question = await Question.findById(id);
  const discussions = question.discussions;
  res.status(200).json({ discussions: discussions });
});
export const putDiscussions = AsyncHandler(async () => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError("Missing ID", 400);
  }

  const { discussion } = req.body;
  if (!discussion) {
    throw new ApiError("Missing required fields", 400);
  }
  const question = await Question.findByIdAndUpdate(id, {
    $push: { discussions: discussion },
  });
  if (!question) {
    throw new ApiError("Question not found", 404);
  }
  res.status(200).json({ message: "Discussion added successfully" });
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
  let allPassed = true;
  for (let i = 0; i < result.length; i++) {
    if (!result[i].status == "passed") {
      allPassed = false;
      break;
    }
  }
  // console.log(allPassed);
  if (allPassed) {
    await LoginUser.findByIdAndUpdate(userid, {
      $push: { questions: qid },
    });
  }


  res.status(200).json({ result, success: true });
});
