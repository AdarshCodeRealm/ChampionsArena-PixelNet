import Organizer from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOTP } from "../utils/otpUtils.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/email.js";
import crypto from "crypto";

/**
 * Controller for organizer registration
 * Requires name, email, password, mobileNumber, aadharNumber, aadharImage and company details
 */
const registerOrganizer = asyncHandler(async (req, res) => {
  // 1. Extract organizer information from request body
  const {
    name,
    email,
    password,
    mobileNumber,
    aadharNumber,
    companyName,
    companyAddress,
    companyRegistrationNumber
  } = req.body;

  // 2. Validate required fields
  if (
    !name ||
    !email ||
    !password ||
    !mobileNumber ||
    !aadharNumber ||
    !companyName ||
    !companyAddress
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // 3. Check if Aadhar number has exactly 12 digits
  if (!/^\d{12}$/.test(aadharNumber)) {
    throw new ApiError(400, "Aadhar number must be exactly 12 digits");
  }

  // 4. Check if mobile number is valid (10 digits)
  if (!/^\d{10}$/.test(mobileNumber)) {
    throw new ApiError(400, "Mobile number must be 10 digits");
  }

  // 5. Check if organizer with same email already exists
  const existingOrganizer = await Organizer.findOne({ email });
  if (existingOrganizer) {
    throw new ApiError(409, "Organizer with this email already exists");
  }

  // 6. Check if Aadhar is already registered
  const aadharExists = await Organizer.findOne({ aadharNumber });
  if (aadharExists) {
    throw new ApiError(409, "Aadhar number is already registered");
  }

  // 7. Handle file upload for Aadhar image
  const aadharImageLocalPath = req.files?.aadharImage?.[0]?.path;
  if (!aadharImageLocalPath) {
    throw new ApiError(400, "Aadhar image is required");
  }

  // 8. Upload Aadhar image to Cloudinary
  const aadharImage = await uploadOnCloudinary(aadharImageLocalPath);
  if (!aadharImage.url) {
    throw new ApiError(500, "Error uploading Aadhar image");
  }

  // 9. Handle profile picture if provided
  let profilePicture = null;
  if (req.files?.profilePicture?.[0]?.path) {
    const profilePictureUploaded = await uploadOnCloudinary(
      req.files.profilePicture[0].path
    );
    if (profilePictureUploaded.url) {
      profilePicture = profilePictureUploaded.url;
    }
  }

  // 10. Generate OTP for email verification
  const { otp, expiresAt } = generateOTP();

  // 11. Create new organizer
  const organizer = await Organizer.create({
    name,
    email,
    password,
    mobileNumber,
    aadharNumber,
    aadharImage: aadharImage.url,
    companyName,
    companyAddress,
    companyRegistrationNumber: companyRegistrationNumber || "",
    profilePicture,
    otp: {
      code: otp,
      expiresAt
    }
  });

  // 12. Send verification email with OTP
  await sendVerificationEmail(email, {
    name,
    otp,
    userType: "organizer"
  });

  // 13. Return success response
  return res.status(201).json(
    new ApiResponse(
      201,
      { email },
      "Organizer registered successfully. Please verify your email with the OTP sent."
    )
  );
});

/**
 * Controller to verify OTP and activate organizer account
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // 1. Validate input
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // 2. Find organizer by email
  const organizer = await Organizer.findOne({ email });
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  // 3. Check if OTP exists and is valid
  if (!organizer.otp || !organizer.otp.code || !organizer.otp.expiresAt) {
    throw new ApiError(400, "No OTP found. Please request a new one");
  }

  // 4. Verify OTP is correct and not expired
  if (organizer.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (new Date() > new Date(organizer.otp.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  // 5. Mark organizer as verified
  organizer.isVerified = true;
  organizer.otp = undefined; // Clear OTP after successful verification
  await organizer.save({ validateBeforeSave: false });

  // 6. Send welcome email
  await sendWelcomeEmail(email, {
    name: organizer.name,
    userType: "organizer"
  });

  // 7. Return success response
  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Email verified successfully. Your account is now pending approval by an administrator."
    )
  );
});

/**
 * Controller to handle organizer login
 */
const loginOrganizer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2. Find organizer by email
  const organizer = await Organizer.findOne({ email });
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  // 3. Verify password
  const isPasswordValid = await organizer.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 4. Check if organizer is verified
  if (!organizer.isVerified) {
    throw new ApiError(403, "Email not verified. Please verify your email first");
  }

  // 5. Generate tokens
  const { accessToken, refreshToken } = generateTokens(organizer);

  // 6. Save refresh token in database
  organizer.refreshToken = refreshToken;
  await organizer.save({ validateBeforeSave: false });

  // 7. Prepare organizer data for response
  const organizerData = {
    _id: organizer._id,
    name: organizer.name,
    email: organizer.email,
    companyName: organizer.companyName,
    profilePicture: organizer.profilePicture,
    isApproved: organizer.isApproved,
    userType: "organizer"
  };

  // 8. Set cookies and send response
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          organizer: organizerData,
          accessToken,
          refreshToken
        },
        "Logged in successfully"
      )
    );
});

/**
 * Controller to refresh access token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Get refresh token from cookies or request body
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized: Refresh token not found");
  }

  // 2. Verify refresh token
  const decodedToken = verifyRefreshToken(incomingRefreshToken);

  // 3. Find organizer with this refresh token
  const organizer = await Organizer.findById(decodedToken?._id);
  if (!organizer) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // 4. Check if refresh token matches
  if (organizer.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or used");
  }

  // 5. Generate new tokens
  const { accessToken, refreshToken } = generateTokens(organizer);

  // 6. Update refresh token in database
  organizer.refreshToken = refreshToken;
  await organizer.save({ validateBeforeSave: false });

  // 7. Set cookies and send response
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

/**
 * Controller to logout organizer
 */
const logoutOrganizer = asyncHandler(async (req, res) => {
  await Organizer.findByIdAndUpdate(
    req.organizer?._id,
    {
      $unset: { refreshToken: 1 }
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export {
  registerOrganizer,
  verifyOTP,
  loginOrganizer,
  refreshAccessToken,
  logoutOrganizer
};