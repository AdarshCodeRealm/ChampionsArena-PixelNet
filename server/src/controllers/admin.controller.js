import Admin from "../models/admin.model.js";
import Organizer from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Controller for admin login
 */
const loginAdmin = asyncHandler(async (req, res) => {
    console.log("Admin login request received");
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2. Find admin by email
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 3. Verify password
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = generateTokens(admin);

  // 5. Save refresh token in database
  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  // 6. Prepare admin data for response
  const adminData = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    userType: "admin"
  };

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
        {
          admin: adminData,
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

  // 3. Find admin with this refresh token
  const admin = await Admin.findById(decodedToken?._id);
  if (!admin) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // 4. Check if refresh token matches
  if (admin.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or used");
  }

  // 5. Generate new tokens
  const { accessToken, refreshToken } = generateTokens(admin);

  // 6. Update refresh token in database
  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

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
 * Controller to logout admin
 */
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin?._id,
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
 * Get all pending organizer approval requests
 */
const getPendingOrganizerRequests = asyncHandler(async (req, res) => {
  const pendingOrganizers = await Organizer.find({
    isVerified: true,
    isApproved: false
  }).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      pendingOrganizers,
      "Pending organizer requests fetched successfully"
    )
  );
});

/**
 * Get organizer details for verification
 */
const getOrganizerDetails = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const organizer = await Organizer.findById(organizerId).select("-password -refreshToken");
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      organizer,
      "Organizer details fetched successfully"
    )
  );
});

/**
 * Approve an organizer
 */
const approveOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;
  const adminId = req.admin._id;

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.isApproved) {
    throw new ApiError(400, "Organizer is already approved");
  }

  // Update organizer status to approved
  organizer.isApproved = true;
  organizer.approvedBy = adminId;
  organizer.approvalDate = new Date();
  organizer.rejectionReason = null;
  
  await organizer.save();

  // TODO: Send approval notification email to organizer

  return res.status(200).json(
    new ApiResponse(
      200,
      { organizerId: organizer._id },
      "Organizer approved successfully"
    )
  );
});

/**
 * Reject an organizer
 */
const rejectOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.isApproved) {
    throw new ApiError(400, "Cannot reject an already approved organizer");
  }

  // Update rejection reason
  organizer.rejectionReason = reason;
  await organizer.save();

  // TODO: Send rejection notification email to organizer

  return res.status(200).json(
    new ApiResponse(
      200,
      { organizerId: organizer._id },
      "Organizer rejected successfully"
    )
  );
});

/**
 * Get all approved organizers
 */
const getApprovedOrganizers = asyncHandler(async (req, res) => {
  const approvedOrganizers = await Organizer.find({
    isVerified: true,
    isApproved: true
  }).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      approvedOrganizers,
      "Approved organizers fetched successfully"
    )
  );
});

/**
 * Get all players
 */
const getAllPlayers = asyncHandler(async (req, res) => {
  const playerAuthModel = await import('../models/playerAuth.model.js');
  const PlayerAuth = playerAuthModel.default;
  
  const players = await PlayerAuth.find()
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      players,
      "All players fetched successfully"
    )
  );
});

/**
 * Admin creates an organizer directly (isVerified and isApproved true)
 */
export const createOrganizerByAdmin = asyncHandler(async (req, res) => {
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

  // Validate required fields
  if (!name || !email || !password || !mobileNumber || !aadharNumber || !companyName || !companyAddress) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (!/^\d{12}$/.test(aadharNumber)) {
    throw new ApiError(400, "Aadhar number must be exactly 12 digits");
  }
  if (!/^\d{10}$/.test(mobileNumber)) {
    throw new ApiError(400, "Mobile number must be 10 digits");
  }

  // Check for existing organizer
  const existingOrganizer = await Organizer.findOne({ email });
  if (existingOrganizer) {
    throw new ApiError(409, "Organizer with this email already exists");
  }
  const aadharExists = await Organizer.findOne({ aadharNumber });
  if (aadharExists) {
    throw new ApiError(409, "Aadhar number is already registered");
  }

  // Handle file upload for Aadhar image
  const aadharImageLocalPath = req.files?.aadharImage?.[0]?.path;
  console.log('Aadhar image local path:', aadharImageLocalPath);

  if (!aadharImageLocalPath) {
    throw new ApiError(400, "Aadhar image is required");
  }
  const aadharImage = await uploadOnCloudinary(aadharImageLocalPath);
  console.log('Cloudinary upload result:', aadharImage);
  if (!aadharImage?.url) {
    throw new ApiError(500, "Error uploading Aadhar image");
  }

  // Handle profile picture if provided
  let profilePicture = null;
  if (req.files?.profilePicture?.[0]?.path) {
    const profilePictureUploaded = await uploadOnCloudinary(req.files.profilePicture[0].path);
    if (profilePictureUploaded?.url) {
      profilePicture = profilePictureUploaded.url;
    }
  }

  // Create organizer (isVerified and isApproved true)
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
    isVerified: true,
    isApproved: true,
    approvedBy: req.admin?._id,
    approvalDate: new Date()
  });

  return res.status(201).json(
    new ApiResponse(201, { organizer }, "Organizer created and approved by admin.")
  );
});

export {
  loginAdmin,
  refreshAccessToken,
  logoutAdmin,
  getPendingOrganizerRequests,
  getOrganizerDetails,
  approveOrganizer,
  rejectOrganizer,
  getApprovedOrganizers,
  getAllPlayers
};