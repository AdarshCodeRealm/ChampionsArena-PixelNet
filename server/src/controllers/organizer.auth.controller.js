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
    companyRegistrationNumber,
    upiAddress
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
  console.log(aadharImage)
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
    },
    upiAddress: upiAddress || '',
  });

  // 12. Send verification email with OTP
  await sendVerificationEmail(email, otp);

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
  await sendWelcomeEmail(email, organizer.name);

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
 * Controller for forgot password request
 * Sends an OTP to the organizer's email
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // 1. Validate input
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // 2. Find organizer by email
  const organizer = await Organizer.findOne({ email });
  if (!organizer) {
    throw new ApiError(404, "No organizer found with this email address");
  }

  // 3. Generate OTP
  const { otp, expiresAt } = generateOTP();

  // 4. Save OTP to organizer document
  organizer.otp = {
    code: otp,
    expiresAt
  };
  
  await organizer.save({ validateBeforeSave: false });

  // 5. Send OTP via email
  await sendVerificationEmail(email, otp, "Password Reset");

  // 6. Return success response
  return res.status(200).json(
    new ApiResponse(
      200,
      { email },
      "Password reset OTP sent to your email. Use this code to reset your password."
    )
  );
});

/**
 * Controller to reset password with OTP
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // 1. Validate input
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP and new password are required");
  }

  // 2. Find organizer with email
  const organizer = await Organizer.findOne({ email });

  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  // 3. Check if OTP exists and is not expired
  if (!organizer.otp || !organizer.otp.code || !organizer.otp.expiresAt) {
    throw new ApiError(400, "No OTP found. Please request a new one");
  }

  if (new Date() > new Date(organizer.otp.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  // 4. Verify OTP
  if (organizer.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // 5. Update password and clear OTP
  organizer.password = newPassword;
  organizer.otp = undefined;
  
  // 6. Save the changes
  await organizer.save();

  // 7. Return success response
  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Password has been reset successfully. Please log in with your new password."
    )
  );
});

/**
 * Controller to send login OTP for two-factor authentication
 */
const sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // 1. Validate input
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // 2. Find organizer by email
  const organizer = await Organizer.findOne({ email });
  if (!organizer) {
    throw new ApiError(404, "No organizer found with this email address");
  }

  // 3. Generate OTP
  const { otp, expiresAt } = generateOTP();

  // 4. Save OTP to organizer document
  organizer.otp = {
    code: otp,
    expiresAt
  };
  
  await organizer.save({ validateBeforeSave: false });

  // 5. Send OTP via email
  await sendVerificationEmail(email, otp, "Login Verification");

  // 6. Return success response
  return res.status(200).json(
    new ApiResponse(
      200,
      { email },
      "Login OTP sent to your email. Please verify to complete login."
    )
  );
});

/**
 * Modified controller to handle organizer login with two-factor authentication
 */
const loginOrganizer = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;

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

  // 5. Check if OTP is provided
  if (!otp) {
    // If OTP not provided, generate and send a new one
    const { otp: newOtp, expiresAt } = generateOTP();
    
    organizer.otp = {
      code: newOtp,
      expiresAt
    };
    
    await organizer.save({ validateBeforeSave: false });
    
    // Send OTP via email
    await sendVerificationEmail(email, newOtp, "Login Verification");
    
    return res.status(200).json(
      new ApiResponse(
        200,
        { email },
        "OTP has been sent to your email. Please verify to complete login."
      )
    );
  }

  // 6. Verify OTP
  if (!organizer.otp || !organizer.otp.code || organizer.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (new Date() > new Date(organizer.otp.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  // 7. Clear OTP after successful verification
  organizer.otp = undefined;

  // 8. Generate tokens
  const { accessToken, refreshToken } = generateTokens(organizer);

  // 9. Save refresh token in database
  organizer.refreshToken = refreshToken;
  await organizer.save({ validateBeforeSave: false });

  // 10. Prepare organizer data for response
  const organizerData = {
    _id: organizer._id,
    name: organizer.name,
    email: organizer.email,
    companyName: organizer.companyName,
    profilePicture: organizer.profilePicture,
    isApproved: organizer.isApproved,
    userType: "organizer"
  };

  // 11. Set cookies and send response
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

/**
 * Controller to update organizer profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const organizerId = req.organizer?._id;
  
  // 1. Validate if organizer exists
  if (!organizerId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 2. Get update data from request
  const {
    name,
    mobileNumber,
    companyName,
    companyAddress,
    companyRegistrationNumber,
    upiAddress
  } = req.body;

  // 3. Find organizer to update
  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  // 4. Update fields if provided
  if (name) organizer.name = name;
  if (mobileNumber) {
    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      throw new ApiError(400, "Mobile number must be 10 digits");
    }
    organizer.mobileNumber = mobileNumber;
  }
  if (companyName) organizer.companyName = companyName;
  if (companyAddress) organizer.companyAddress = companyAddress;
  if (companyRegistrationNumber) organizer.companyRegistrationNumber = companyRegistrationNumber;
  if (upiAddress !== undefined) organizer.upiAddress = upiAddress;

  // 5. Handle profile picture update if provided
  if (req.file) {
    // Delete old profile picture if it exists
    if (organizer.profilePicture) {
      const publicId = organizer.profilePicture.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }
    
    // Upload new profile picture
    const profilePictureUploaded = await uploadOnCloudinary(req.file.path);
    if (profilePictureUploaded.url) {
      organizer.profilePicture = profilePictureUploaded.url;
    }
  }

  // 6. Save updated organizer
  await organizer.save({ validateBeforeSave: false });

  // 7. Return updated organizer data (excluding sensitive fields)
  const updatedOrganizerData = {
    _id: organizer._id,
    name: organizer.name,
    email: organizer.email,
    mobileNumber: organizer.mobileNumber,
    companyName: organizer.companyName,
    companyAddress: organizer.companyAddress,
    companyRegistrationNumber: organizer.companyRegistrationNumber,
    upiAddress: organizer.upiAddress,
    profilePicture: organizer.profilePicture,
    isApproved: organizer.isApproved
  };

  // 8. Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedOrganizerData,
      "Profile updated successfully"
    )
  );
});

/**
 * Controller to get current organizer profile
 */
const getCurrentOrganizer = asyncHandler(async (req, res) => {
  const organizerId = req.organizer?._id;
  
  // 1. Validate if organizer exists
  if (!organizerId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 2. Find organizer by ID
  const organizer = await Organizer.findById(organizerId).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires -verificationToken"
  );
  
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  // 3. Send response with organizer data
  return res.status(200).json(
    new ApiResponse(
      200,
      organizer,
      "Organizer details fetched successfully"
    )
  );
});

export {
  registerOrganizer,
  verifyOTP,
  loginOrganizer,
  refreshAccessToken,
  logoutOrganizer,
  updateProfile,
  getCurrentOrganizer,
  forgotPassword,
  resetPassword,
  sendLoginOTP
};