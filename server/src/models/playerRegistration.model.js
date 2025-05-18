import mongoose from "mongoose";
import bcrypt from "bcrypt";

const playerRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    plainPassword: {
      type: String, // Store the original password before hashing
      select: false, // Don't include in query results by default for security
    },
    uid: {
      type: String,
      required: true,
      trim: true,
      comment: "FreeFire user ID",
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    profilePictureUrl: {
      type: String, // URL to cloudinary or other storage
      default: null,
    },
    otp: {
      code: {
        type: String,
        required: true
      },
      expiresAt: {
        type: Date,
        required: true
      },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: { 
      type: Date,
      default: Date.now,
      expires: '1h' // Automatically delete document after 1 hour if not verified
    }
  }
);

// Hash password before saving
playerRegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // Store original password before hashing
  this.plainPassword = this.password;
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to verify OTP
playerRegistrationSchema.methods.verifyOTP = function (otp) {
  return this.otp.code === otp && this.otp.expiresAt > new Date();
};

// Method to update OTP attempt count
playerRegistrationSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.attempts;
};

const PlayerRegistration = mongoose.model("PlayerRegistration", playerRegistrationSchema);

export default PlayerRegistration;