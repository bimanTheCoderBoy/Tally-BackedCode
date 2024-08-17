
import mongoose from "mongoose";
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Question from '../models/Questions.model.js';
import LoginUser from '../models/LoginUser.model.js';


const getCategoryPoints = (category) => {
    const categories = {
        'basic': 0,
        'array': 3,
        'matrix': 6,
        'linked list': 9,
        'tree': 12,
        'graph': 15,
        'hash table': 18,
        'set': 21,
        'map': 24,
        'recursion': 27,
        'backtracking': 30,
        'divide and conquer': 33,
        'greedy': 39,
        'dynamic programming': 42,
        'trie': 45
    };
    return categories[category] || 0;
    // return categories.category || 0;
};


const getDifficultyPoints = (difficulty) => {
    const difficulties = {
        'Easy': 1,
        'Medium': 2,
        'Hard': 3
    };
    return difficulties[difficulty] || 0;
    // return difficulties.difficulty || 0;
};


// Calculate priority
const calculatePriority = (category, difficulty) => {
    const categoryPoint = getCategoryPoints[category] || 0;
    const difficultyPoint = getDifficultyPoints[difficulty] || 0;
    return categoryPoint + difficultyPoint;
};


export const recommendation = AsyncHandler(async (req, res, next) => {


    // Check if user is LoginUser
    if (!req.auth) {
        return res.status(401).json({ success: true, message: 'You need to log in to get recommendations' });
    }


    const { category, difficulty } = req.body;


    // Check for required fields ( if blanck or not )
    if (!category || !difficulty) {
        return res.status(400).json({ success: true, message: 'Category and difficulty are required' });
    }


    // Calculate priority
    // const categoryPoints = getCategoryPoints(category);
    // const difficultyPoints = getDifficultyPoints(difficulty);
    // const priority = categoryPoints + difficultyPoints;


    // Get user and their solved questions
    const user = await LoginUser.findById(req.user._id).populate('questionSolved');
    if (!user) {
        return res.status(404).json({ success: true, message: 'User not found' });
    }

    // Calculate average priority of the last 5 solved questions
    const solvedQuestions = user.questionSolved.slice(-5);
    const totalPriority = solvedQuestions.reduce((acc, question) => {
        const catPoints = getCategoryPoints(question.categories);
        const diffPoints = getDifficultyPoints(question.difficulty);
        return acc + (catPoints + diffPoints);
    }, 0);
    const averagePriority = totalPriority / solvedQuestions.length;

    // Retrieve questions based on priority
    const priority1 = averagePriority + 1;
    const priority2 = averagePriority + 2;


    // Find questions with priority (averagePriority + 1) and (averagePriority + 2)
  const questions1 = await Question.find({
    $expr: {
      $eq: [calculatePriority('$category', '$difficulty'), priority1]
    }
  }).limit(2);

  const questions2 = await Question.find({
    $expr: {
      $eq: [calculatePriority('$category', '$difficulty'), priority2]
    }
  }).limit(3);

    // Respond with recommended questions
    res.status(200).json({
        // priority1Questions: questions1,
        // priority2Questions: questions2,
        recommendedQuestions: [
            ...questions1,
            ...questions2
        ],
    });
});


export default recommendation