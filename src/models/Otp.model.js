
import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  email: {
    type: String, 
    required: true
  },
  otp: {
    type: Number, 
    required: true
  },
  expiresAt: {
    type: Date, 
    required: true
  }
});


export default mongoose.model('Otp', OtpSchema);