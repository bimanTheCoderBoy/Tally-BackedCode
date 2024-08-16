import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const LoginUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, "userName allready taken"],
      length: [3, "username must be longer than"],
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email allready taken"],
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    questionSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        unique: true, // Ensure uniqueness of ObjectIds in the array, means the array will act as a set
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    contests: [
      {
        data: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        contest: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Contest",
        },
      },
    ],
    room: {
      type: new mongoose.Schema(
        {
          roomName: { type: String },
          roomId: { type: String },
        },
        { _id: false }
      ),
    },
  },
  { timestamps: true }
);

// before save ( if password is modified )
LoginUserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// generate access token
LoginUserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access token
LoginUserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export default mongoose.model("LoginUser", LoginUserSchema);
