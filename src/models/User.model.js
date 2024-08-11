
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  questions:{type:[{ type:mongoose.Schema.Types.ObjectId,ref:"Question"}]}
},{timestamps:true});

export default mongoose.model('User', UserSchema);
