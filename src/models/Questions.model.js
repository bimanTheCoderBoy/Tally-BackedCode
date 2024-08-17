

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
  categories: {
    type: String,
    enum: [
      { name: 'basic', points: 0 },
      { name: 'array', points: 3 },
      { name: 'matrix', points: 6 },
      { name: 'linked list', points: 9 },
      { name: 'tree', points: 12 },
      { name: 'graph', points: 15 },
      { name: 'hash table', points: 18 },
      { name: 'set', points: 21 },
      { name: 'map', points: 24 },
      { name: 'recursion', points: 27 },
      { name: 'backtracking', points: 30 },
      { name: 'divide and conquer', points: 33 },
      { name: 'greedy', points: 39 },
      { name: 'dynamic programming', points: 42 },
      { name: 'trie', points: 45 },
    ],
    required: true,
  },
  constraints: {
    type: [String], 
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

