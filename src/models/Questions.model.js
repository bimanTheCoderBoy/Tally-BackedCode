

import mongoose from 'mongoose'


// Define the schema for a test case
const TestCaseSchema = new mongoose.Schema({
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
});

  

// Define the main schema for the coding question
const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  constraints: {
    type: [String], // An array of strings representing constraints
    required: true,
  },
  testCases: {
    type: [TestCaseSchema], // An array of test cases
    required: true,
  },
  author: {
    type: String
  },
  discussions: {
    type: [String], // An array of strings representing discussion topics
    
  },
}, {timestramps :true});


// Create the model from the schema
export default mongoose.model('Question', QuestionSchema);

