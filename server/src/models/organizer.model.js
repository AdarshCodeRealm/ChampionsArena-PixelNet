import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Organizer schema for the Champions Arena tournament
 * Represents an organizer user type with company and payment information
 * Uses OTP-based passwordless authentication
 */
const organizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    upiId: {
      type: String,
      required: [true, "UPI ID is required for payments"],
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
    isApproved: {
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
      default: "organizer",
    },
    tournaments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    }],
    // Additional fields for organizer verification
    companyLogo: {
      type: String,
      default: "",
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    documents: [{
      name: String,
      url: String,
      verified: {
        type: Boolean,
        default: false
      }
    }],
  },
  { timestamps: true }
);

// Hash password before saving (only if password field is provided)
organizerSchema.pre("save", async function (next) {
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
organizerSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Method to generate OTP
organizerSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
  return otp;
};

// Method to verify OTP
organizerSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && this.otpExpiry > new Date();
};

// Method to record successful OTP login
organizerSchema.methods.recordOTPLogin = function () {
  this.otpLoginTimestamp = new Date();
  this.otp = undefined;
  this.otpExpiry = undefined;
};

export const Organizer = mongoose.model("Organizer", organizerSchema); 