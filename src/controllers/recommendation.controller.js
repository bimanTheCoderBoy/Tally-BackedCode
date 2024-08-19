
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





export const recommendation = AsyncHandler(async (req, res, next) => {

    
    // Check if user is LoginUser
    if (!req.auth) {
        return res.status(401).json({ success: false, message: 'You need to log in to get recommendations' });
    }


    // Get user and their solved questions
    const logedinUser = await LoginUser.findById(req.user._id).populate('questionSolved');
    if (!logedinUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // If the user is new (has not solved any questions)
    
    if (logedinUser.questionSolved.length === 0) {
        const basicQuestions = await Question.find({ 'categories.name':'basic' }).limit(4);
        const arrayQuestion = await Question.find({ 'categories.name': 'array' }).limit(1);
        // console.log(basicQuestions);
        // console.log(arrayQuestion);
        return res.status(200).json({
            success: true,
            recommendedQuestions: [
                ...basicQuestions,
                ...arrayQuestion
            ],
        });
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
    const questions1 = await Question.aggregate([
        // Add fields to map difficulty to points and then calculate the total points
        {
          $addFields: {
            difficultyPoints: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "Easy"] }, then: 1 },
                  { case: { $eq: ["$difficulty", "Medium"] }, then: 2 },
                  { case: { $eq: ["$difficulty", "Hard"] }, then: 3 }
                ],
                default: 0 // Default to 0 if no match
              }
            },
          }
        },
        {
            $addFields: {
            totalPoints: {
                $add: ["$categories.points", "$difficultyPoints"]
              }
            }
        },
       
        // Match documents where totalPoints equals the target sum (10)
        {
          $match: {
            totalPoints:14
          }
        }, {
            $limit: 6
          },
      ]);
    //   console.log(questions1);
      const questions2 = await Question.aggregate([
        // Add fields to map difficulty to points and then calculate the total points
        {
          $addFields: {
            difficultyPoints: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "Easy"] }, then: 1 },
                  { case: { $eq: ["$difficulty", "Medium"] }, then: 2 },
                  { case: { $eq: ["$difficulty", "Hard"] }, then: 3 }
                ],
                default: 0 // Default to 0 if no match
              }
            },
          }
        },
        {
            $addFields: {
            totalPoints: {
                $add: ["$categories.points", "$difficultyPoints"]
              }
            }
        },
        
        // Match documents where totalPoints equals the target sum (10)
        {
          $match: {
            totalPoints: 4
          }
        },
        {
            $limit: 4
          },
      ]);
      
  
 

    // Respond with recommended questions
    res.status(200).json({
        success: true,
        // priority1Questions: questions1,
        // priority2Questions: questions2,
        recommendedQuestions: [
            ...questions1,
            ...questions2
        ],
    });
});


export default recommendation