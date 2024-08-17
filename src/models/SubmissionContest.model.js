import mongoose from 'mongoose';

// submission question in a conest schema
const SubmissionContestSchema = new mongoose.Schema({
    temporaryUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    isLoginUser: {
        type: Boolean,
        required: true
    },
    LoginUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginUser', // Reference to the LoginUser model
        // this is not required, so if lohin user then put this
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // Reference to the Question model
        required: true
    },
    contestCode: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['C', 'C++', 'Java', 'Python', 'c', 'c++', 'java', 'python', 'CPP', 'cpp'], // Supported languages
    }
}, { timestamps: true } );

export default mongoose.model('SubmissionContest', SubmissionContestSchema);
