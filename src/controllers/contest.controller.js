import mongoose from "mongoose";
import Contest from "../models/Contest.model.js";
import Question from "../models/Questions.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import fs from "fs";
import User from "../models/User.model.js";
import LoginUser from "../models/LoginUser.model.js";
import { runJavaCompile, runJavaInDocker,runTestCaseJava } from "../utils/runJavaCode.js";
import { runPythonTestCase } from "../utils/runPythonCode.js";
// import jwt from 'jsonwebtoken'
import SubmissionContest from '../models/SubmissionContest.model.js'


// Get all ongoing contests
export const getAllContests = AsyncHandler(async (req, res) => {
  // Find contests where the end time is greater than or equal to the current date
  const contests = await Contest.find().select(
    "title startTime endTime contestCode"
  );

  // Check if there are no ongoing contests
  if (contests.length === 0) {
    return res.status(404).json({ message: "No contests found.", success: false });
  }
  // Send the list of ongoing contests
  res.status(200).json({ contests, success: true });
});

// Get a single contest by ID
export const getContestById = AsyncHandler(async (req, res) => {
  const { contestcode } = req.params;
  console.log(contestcode);
  // Validate the ID format (assuming it's a MongoDB ObjectId)

  // const contest = await Contest.findById(id).populate('questions');
  const contest = await Contest.findOne({ contestCode: contestcode })
    .select(" -__v")
    .populate({
      path: "questions",
      select: "title difficulty",
    });


  // Check if the contest was found
  if (!contest) {
    return res.status(404).json({ message: "Contest not found", success: false });
  }

  // Send the contest details in the response
  res.status(200).json({ contest, success: true });
});

// Create a new contest
export const createContest = AsyncHandler(async (req, res) => {
  // Extract fields from request body
  const { title, startTime, endTime, questions } = req.body;

  // console.log(title);
  // console.log(description);
  // console.log(creator);
  // console.log(startTime);
  // console.log(endTime);
  // console.log(questions);

  // Validate required fields
  if (!title || !startTime || !endTime || !questions) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate field types
  if (
    !Array.isArray(questions) ||
    !questions.every(mongoose.Types.ObjectId.isValid)
  ) {
    return res
      .status(400)
      .json({ message: "Problems must be an array of valid ObjectIds." });
  }

  // Validate date fields
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid date format for startTime or endTime." });
  }
  if (start >= end) {
    return res
      .status(400)
      .json({ message: "startTime must be before endTime." });
  }

  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Create new contest
  const newContest = new Contest({
    title,
    startTime: start,
    endTime: end,
    contestCode: result,
    questions,
  });

  // Save the contest to the database
  await newContest.save();

  // Send success response
  res.status(201).json({ code: newContest.contestCode, success: true });
});

// Join a contest
export const joinContest = AsyncHandler(async (req, res) => {


  // const { id } = req.params;
  const { userName, contestCode } = req.body;

  // Validate userName & contestCode
  if (!userName || !contestCode) {
    res.status(400).json({ message: "userName or contest code are required" });
    return;
  }

  // Find the contest and check if it exists
  const contest = await Contest.findOne({ contestCode });
  if (!contest) {
    return res.status(404).json({ message: "Contest not found", success: false });
  }

  // Check if the contest is ongoing
  const currentTime = new Date();
  if (currentTime < contest.startTime || currentTime > contest.endTime) {
    return res.status(200).json({ message: "This contest is not ongoing." });
  }

  // Access the 'contest' cookie
  const contestCookie = req.cookies.contest;

  // console.log(contestCookie.userid);

  // Check if the cookie exists
  if (contestCookie) {
    // Extract userid and contestCode from the cookie
    const { userid } = JSON.parse(contestCookie);

  

    // return user details if already added
    if (contest.participants.includes(userid)) {
      const findUser = await User.findById(userid);
      res.status(200).json({
        username: findUser.username,
        questions: findUser.questions,
      });
      return;
    } 
  }

  // Add the user to the participants array
  const user = await User.create({
    username: userName,
  });
  contest.participants.push(user._id);


  // Save the updated contest
  await contest.save();


  // add the reference of this temporary user to the LoginUser contests array if this is a logedin user
  // const alreadyLoginUser = req.user;
  
  if(req.auth==true){
    const alreadyLoginUser =await LoginUser.findOne(req.user._id);
    alreadyLoginUser.contests.push({data:user._id,contestCode});
    // Save the updated Login User
  await alreadyLoginUser.save();
  }


 


  // Calculate the time difference for the cookie expiration
  const expiresIn = new Date(contest.endTime) - new Date();

  const options = {
    expires: new Date(Date.now() + expiresIn), // Set expiration to contest end time
    httpOnly: true,
  };
  res.cookie(
    "contest",
    JSON.stringify({ userid: user._id, contestCode }),
    options
  );
  console.log(res.cookies);
  // Respond with success
  res
    .status(200)
    .json({ message: "User successfully joined the contest.", userName, success: true });
});

export const submitContest = AsyncHandler(async (req, res) => {
  res.clearCookie("contest");
  res.status(200).json({ message: "User successfully submitted the contest", success: true });
});


export const submitQuestion = AsyncHandler(async (req, res) => {
  const { qid } = req.params;
  const data = req.cookies.contest;
  const { userid, contestCode } = JSON.parse(data);

  const { code, language, className } = req.body;

  //run the test cases
  // console.log(language, code, input);

  // console.log(language, code, input);

  if (!language || !code) {
    throw new ApiError("Missing required fields", 400);
  }
  if (!qid) {
    throw new ApiError("Missing ID", 400);
  }

  const question = await Question.findById(qid);
  if (!question) {
    throw new ApiError("Question not found", 404);
  }
  const testCases = question.testCases;


  let result =[];
  switch (language) {
    case 'java':
        result =  await runTestCaseJava(code, className, testCases);
        break;
    case 'python':
      result = await runPythonTestCase(code, testCases);
        break;
    case 'java':
        output = await runJavaCode(code, input,className);
        break;
    case 'java':
        output = await runJavaCode(code, input,className);
        break;
    default:
        throw new ApiError('Unsupported language', 404);
}
   
  //compile the code
  let allPassed = true;
  for (let i = 0; i < result.length; i++) {
    if (!result[i].status == "passed") {
      allPassed = false;
      break;
    }
  }
  // console.log(allPassed);
  if (allPassed) {
    const response = await User.findByIdAndUpdate(userid, {
      $push: { questions: qid },
    });
  }


  // Add a new submission to the Submission collection
  const newSubmission = new Submission({
    temporaryUserId: userid,
    isLoginUser: req.auth ? true : false, // true for LoginUser, false for temporary user
    questionId: qid,
    contestId: contestCode,
    code: code,
    language: language,
  });

  await newSubmission.save();


  res.status(200).json({ result, success: true });
});

export const getUser = AsyncHandler(async (req, res, next) => {
  // Access the 'contest' cookie
  const contestCookie = req.cookies.contest;

  // Check if the cookie exists
  if (contestCookie) {
    // Extract userid from the cookie
    const { userid, contestCode } = JSON.parse(contestCookie);

    const contest = await Contest.findOne({ contestCode });
    // return user details if already added
    if (contest.participants.includes(userid)) {
      const findUser = await User.findById(userid);
      res.status(200).json({
        findUser,
        contestCode,
        success: true,
      });
    }
  } else {
    return res.status(200).json({ success: false, message: "User not found" });
  }
});

export const getLeaderboard = AsyncHandler(async (req, res) => {
  const { contestcode } = req.params;

  const contest = await Contest.findOne({ contestCode: contestcode }).populate(
    "participants"
  );
  if (!contest) {
    return res.status(404).json({ success: false, message: "Contest not found" });
  }
  const particepents = contest.participants;

  //build the list of participants
  const board = particepents.map((ele) => {
    return {
      name: ele.username,
      noq: ele.questions.length,
      time: ele.updatedAt,
    };
  });
  board.sort((a, b) => {
    // First, compare by numberOfQuestionsDone (descending)
    if (b.noq !== a.noq) {
      return b.noq - a.noq;
    }
    // If numberOfQuestionsDone is the same, compare by submitTime (ascending)
    return new Date(a.time) - new Date(b.time);
  });
  res.send({ participants: board, success: true });

});


