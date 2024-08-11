
import mongoose from 'mongoose';
function generateRandomString(length = 8) {
 
  return Math.floor(Math.random() * 100000);
}
const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true 
  },
 
  contestCode:{
    type:String,
    default:generateRandomString()
  },
  
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

export default mongoose.model('Contest', ContestSchema);
