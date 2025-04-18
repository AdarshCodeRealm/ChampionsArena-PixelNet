import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Player schema for the Champions Arena tournament
 * Represents a player user type with game-specific information
 * Uses OTP-based passwordless authentication
 */
const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "In-game name (IGN) is required"],
      unique: true,
      trim: true,
      index: true,
    },
    uid: {
      type: String,
      required: [true, "FreeFire UID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Password is now optional
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    otpLoginTimestamp: {
      type: Date,
    },
    userType: {
      type: String,
      default: "player",
    },
    tournaments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    }],
    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }],
  },
  { timestamps: true }
);

// Hash password before saving (only if password field is provided)
playerSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare password (only used if password exists)
playerSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Method to generate OTP
playerSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
  return otp;
};

// Method to verify OTP
playerSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && this.otpExpiry > new Date();
};

// Method to record successful OTP login
playerSchema.methods.recordOTPLogin = function () {
  this.otpLoginTimestamp = new Date();
  this.otp = undefined;
  this.otpExpiry = undefined;
};

export const Player = mongoose.model("Player", playerSchema); 