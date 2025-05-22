import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const playerAuthSchema = new mongoose.Schema(
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
    profilePicture: {
      type: String, // URL to cloudinary or other storage
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    privacySettings: {
      isProfilePublic: {
        type: Boolean,
        default: true,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showMobileNumber: {
        type: Boolean,
        default: false,
      },
    },
    verificationToken: {
      type: String,
    },
    otp: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    rank: {
      type: String,
      default: "Rookie",
    },
    level: {
      type: Number,
      default: 1,
    },
    refreshToken: {
      type: String,
    },
    stats: {
      totalMatches: {
        type: Number,
        default: 0,
      },
      matchesWon: {
        type: Number,
        default: 0,
      },
      tournamentsParticipated: {
        type: Number,
        default: 0,
      },
      tournamentsWon: {
        type: Number,
        default: 0,
      },
      killCount: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
playerAuthSchema.pre("save", async function (next) {
  // Skip hashing if password is not modified
  if (!this.isModified("password")) return next();

  // Check if the password is already hashed (from PlayerRegistration)
  // bcrypt hashes always start with $2a$, $2b$ or $2y$
  if (
    this.password.startsWith("$2a$") ||
    this.password.startsWith("$2b$") ||
    this.password.startsWith("$2y$")
  ) {
    // Password appears to be already hashed, skip hashing
    console.log("Skipping hash as password appears to be already hashed");
    return next();
  }

  // Otherwise hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
playerAuthSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
playerAuthSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
playerAuthSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Generate password reset token
playerAuthSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Virtual for player type
playerAuthSchema.virtual("userType").get(function () {
  return "player";
});

const PlayerAuth = mongoose.model("PlayerAuth", playerAuthSchema);

export default PlayerAuth;