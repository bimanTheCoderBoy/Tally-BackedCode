
import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginUser', // Reference to the User model
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // Reference to the Question model
        required: true
    },
    language: {
        type: String,
        required: true,
<<<<<<< HEAD
        enum: ['C', 'C++', 'Java', 'Python', 'c', 'c++', 'java', 'python', 'CPP', 'cpp'], // Supported languages
=======
        enum: ['C', 'C++', 'Java', 'Python','c', 'c++', 'java', 'python'], // Supported languages
>>>>>>> 3fac4fa0113804eab394a4eaf406772405ea5b95
    },
    code: {
        type: String,
        required: true
    }
}, { timestamps: true } );

export default mongoose.model('Submission', SubmissionSchema);