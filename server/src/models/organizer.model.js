import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const organizerSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    aadharNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: [12, "Aadhar number must be 12 digits"],
      maxlength: [12, "Aadhar number must be 12 digits"],
    },
    aadharImage: {
      type: String, // URL to cloudinary or other storage
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    companyRegistrationNumber: {
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
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
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
    refreshToken: {
      type: String,
    },
    tournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
      },
    ],
    upiAddress: {
      type: String,
      trim: true,
      default: ''
    },
  },
  { timestamps: true }
);

// Hash password before saving
organizerSchema.pre("save", async function (next) {
  // Skip hashing if password is not modified
  if (!this.isModified("password")) return next();

  // Check if the password is already hashed
  if (
    this.password.startsWith("$2a$") ||
    this.password.startsWith("$2b$") ||
    this.password.startsWith("$2y$")
  ) {
    console.log("Skipping hash as password appears to be already hashed");
    return next();
  }

  // Otherwise hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
organizerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
organizerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      companyName: this.companyName,
      isApproved: this.isApproved,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
organizerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Generate password reset token
organizerSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Virtual for organizer type
organizerSchema.virtual("userType").get(function () {
  return "organizer";
});

export const Organizer = mongoose.model("Organizer", organizerSchema);
export default Organizer;