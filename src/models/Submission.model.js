
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
        enum: ['C', 'C++', 'Java', 'Python', 'c', 'c++', 'java', 'python', 'CPP', 'cpp'], // Supported languages
    },
    code: {
        type: String,
        required: true
    },
    accepted:{
        type: Boolean,
        default: false
    }
}, { timestamps: true } );

export default mongoose.model('Submission', SubmissionSchema);