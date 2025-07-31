import PlayerAuth from "../models/playerAuth.model.js"
import PlayerRegistration from "../models/playerRegistration.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { generateOTP } from "../utils/otpUtils.js"
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js"
import { generateTokens, verifyRefreshToken } from "../utils/token.js"
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email.js"
import crypto from "crypto"

/**
 * Controller for player registration with email & password
 * Flow:
 * 1. Player fills registration form
 * 2. System creates pending registration and sends OTP
 * 3. Player verifies OTP to complete registration
 * 4. Unverified registrations auto-delete after 1 hour
 * 5. If player tries to register again with existing pending registration, redirect to OTP verification
 */
const registerPlayer = asyncHandler(async (req, res) => {
  console.log("🚀 REGISTER CONTROLLER ENTERED - Player registration process started")
  console.log("📧 Registration attempt for email:", req.body.email)
  console.log("📱 Request method:", req.method)
  console.log("🕒 Timestamp:", new Date().toISOString())
  console.log("📂 Request body:", req.body)

  // 1. Extract player information from request body
  const { name, email, username, password, uid, mobileNumber, otp } = req.body

  // 2. Validate required fields
  if (!name || !email || !username || !password || !uid) {
    throw new ApiError(400, "All required fields must be provided (name, email, username, password, uid)")
  }

  // 3. Check if player already exists in the permanent collection (fully registered)
  const existingPlayer = await PlayerAuth.findOne({
    $or: [{ email }, { username }],
  })

  if (existingPlayer) {
    if (existingPlayer.email === email) {
      if (existingPlayer.isVerified) {
        throw new ApiError(409, "Email is already registered and verified. Please login instead.")
      } else {
        // Player exists but not verified - this shouldn't happen as we use temporary collection
        // But handle it by redirecting to verification
        const { otp: newOTP, expiryTime } = generateOTP()
        
        existingPlayer.otp = {
          code: newOTP, 
          expiresAt: expiryTime,
        }
        await existingPlayer.save({ validateBeforeSave: false })
        
        await sendVerificationEmail(email, newOTP)
        
        return res.status(409).json(
          new ApiResponse(
            409,
            { 
              email, 
              requiresVerification: true,
              redirectToOtp: true,
              message: "Account exists but not verified. New OTP sent to your email." 
            },
            "Please verify your email to complete registration"
          )
        )
      }
    } else {
      throw new ApiError(409, "Username is already taken")
    }
  }

  // 4. Handle OTP verification case
  if (otp) {
    // Try to find the pending registration
    const pendingRegistration = await PlayerRegistration.findOne({ email })

    if (!pendingRegistration) {
      throw new ApiError(
        404,
        "No pending registration found. Registration may have expired. Please start registration again."
      )
    }

    // Verify OTP
    if (!pendingRegistration.verifyOTP(otp)) {
      // Increment failed attempts
      const attempts = pendingRegistration.incrementAttempts()
      await pendingRegistration.save()

      // If too many failed attempts, delete the pending registration
      if (attempts >= 5) {
        await PlayerRegistration.deleteOne({ email })
        throw new ApiError(
          400,
          "Too many failed attempts. Please start registration again"
        )
      }

      throw new ApiError(400, `Invalid or expired OTP. ${5 - attempts} attempts remaining.`)
    }

    // OTP verified - create permanent account
    let profilePictureUrl = pendingRegistration.profilePictureUrl
    if (req.file) {
      // New profile image was provided with verification request
      const uploadResult = await uploadOnCloudinary(req.file.path)
      if (uploadResult) {
        profilePictureUrl = uploadResult.url
        console.log("Uploaded new profile picture:", profilePictureUrl)
      }
    }

    // Create permanent player account
    const playerData = {
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      username: pendingRegistration.username,
      uid: pendingRegistration.uid,
      mobileNumber: pendingRegistration.mobileNumber,
      profilePicture: profilePictureUrl,
      isVerified: true,
    }

    // Create player without password first to avoid double-hashing
    const player = new PlayerAuth(playerData)
    player.password = pendingRegistration.password // Already hashed
    await player.save({ validateModifiedOnly: true })

    // Delete the temporary registration
    await PlayerRegistration.deleteOne({ email })

    // Send welcome email
    await sendWelcomeEmail(player.email, player.name)

    // Generate tokens for auto-login after registration
    const { accessToken, refreshToken } = generateTokens(player)

    // Save refresh token
    player.refreshToken = refreshToken
    await player.save({ validateBeforeSave: false })

    // Return the created player with tokens for auto-login
    const createdPlayer = await PlayerAuth.findById(player._id).select(
      "-password -refreshToken -otp"
    )

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            player: createdPlayer,
            accessToken,
            refreshToken,
          },
          "Registration successful! Your account has been created and you are now logged in."
        )
      )
  }

  // 5. Initial registration request (no OTP provided)

  // 5a. Check for existing pending registration
  const existingRegistration = await PlayerRegistration.findOne({ email })

  if (existingRegistration) {
    // Check if username is different and if it's already taken
    if (existingRegistration.username !== username) {
      const usernameExists = await PlayerRegistration.findOne({ 
        username, 
        email: { $ne: email } 
      }) || await PlayerAuth.findOne({ username })
      
      if (usernameExists) {
        throw new ApiError(409, "Username is already taken")
      }
    }

    // Generate new OTP for existing registration
    const { otp: newOTP, expiryTime } = generateOTP()

    // Update the existing registration with new data
    existingRegistration.name = name
    existingRegistration.username = username
    existingRegistration.password = password
    existingRegistration.uid = uid
    existingRegistration.mobileNumber = mobileNumber
    existingRegistration.otp = {
      code: newOTP,
      expiresAt: expiryTime,
    }
    existingRegistration.attempts = 0 // Reset attempt counter

    // Handle profile image if provided
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path)
      if (uploadResult) {
        existingRegistration.profilePictureUrl = uploadResult.url
      }
    }

    await existingRegistration.save()

    // Send OTP email
    await sendVerificationEmail(email, newOTP)

    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          { 
            email, 
            requiresVerification: true,
            isExistingRegistration: true,
            redirectToOtp: true,
            expiresIn: "1 hour",
            message: "You already started registration with this email. A new verification code has been sent." 
          },
          "Registration in progress. Please verify your email to complete registration."
        )
      )
  }

  // 5b. Create new pending registration

  // Check if username is already taken (in both collections)
  const usernameExists = await PlayerRegistration.findOne({ username }) || 
                        await PlayerAuth.findOne({ username })
  
  if (usernameExists) {
    throw new ApiError(409, "Username is already taken")
  }

  // Handle profile image upload if provided
  let profilePictureUrl = null
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path)
    if (uploadResult) {
      profilePictureUrl = uploadResult.url
    }
  }

  // Generate OTP
  const { otp: newOTP, expiryTime } = generateOTP()

  // Create temporary registration record (will auto-delete after 1 hour)
  const registrationData = await PlayerRegistration.create({
    name,
    email,
    username,
    password,
    uid,
    mobileNumber,
    profilePictureUrl,
    otp: {
      code: newOTP,
      expiresAt: expiryTime,
    },
  })

  if (!registrationData) {
    throw new ApiError(500, "Something went wrong while creating registration")
  }

  // Send verification email
  await sendVerificationEmail(email, newOTP)

  // Return response indicating OTP has been sent
  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        { 
          email, 
          requiresVerification: true,
          isNewRegistration: true,
          redirectToOtp: true,
          expiresIn: "1 hour",
          message: "Registration started successfully. Please check your email for verification code." 
        },
        "Verification code sent to your email. Please verify within 1 hour to complete registration."
      )
    )
})

/**
 * Controller for resending OTP
 * Works with both permanent accounts requiring verification
 * and pending registrations
 */
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  // First check if there's a pending registration
  const pendingRegistration = await PlayerRegistration.findOne({ email })

  if (pendingRegistration) {
    // Generate new OTP for pending registration
    const { otp, expiryTime } = generateOTP()

    // Update OTP
    pendingRegistration.otp = {
      code: otp,
      expiresAt: expiryTime,
    }
    pendingRegistration.attempts = 0 // Reset attempts counter

    await pendingRegistration.save()

    // Send OTP email
    await sendVerificationEmail(email, otp)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Verification code sent successfully to complete your registration"
        )
      )
  }

  // Check for unverified permanent account
  const player = await PlayerAuth.findOne({ email, isVerified: false })

  if (player) {
    // Generate new OTP
    const { otp, expiryTime } = generateOTP()

    // Save OTP to player
    player.otp = {
      code: otp,
      expiresAt: expiryTime,
    }

    await player.save({ validateBeforeSave: false })

    // Send OTP email
    await sendVerificationEmail(email, otp)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Verification code sent successfully to verify your account"
        )
      )
  }

  // No pending registration or unverified account found
  throw new ApiError(
    404,
    "No pending registration or unverified account found with this email"
  )
})

/**
 * Controller for email verification with OTP
 * Handles verification for both pending registrations and permanent accounts
 */

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required")
  }

  // First check pending registrations
  const pendingRegistration = await PlayerRegistration.findOne({ email })

  if (pendingRegistration) {
    // Verify OTP
    if (!pendingRegistration.verifyOTP(otp)) {
      // Increment failed attempts
      const attempts = pendingRegistration.incrementAttempts()
      await pendingRegistration.save()

      // If too many failed attempts, delete the pending registration
      if (attempts >= 5) {
        await PlayerRegistration.deleteOne({ email })
        throw new ApiError(
          400,
          "Too many failed attempts. Please start registration again"
        )
      }

      throw new ApiError(400, "Invalid or expired OTP")
    }

    // OTP is valid - create permanent account
    const player = await PlayerAuth.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      username: pendingRegistration.username,
      password: pendingRegistration.password, // This is already hashed and needs special handling
      uid: pendingRegistration.uid,
      mobileNumber: pendingRegistration.mobileNumber,
      profilePicture: pendingRegistration.profilePictureUrl,
      isVerified: true,
    })

    // Delete the temporary registration
    await PlayerRegistration.deleteOne({ email })

    // Send welcome email
    await sendWelcomeEmail(player.email, player.name)

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          verified: true,
          accountCreated: true,
        },
        "Email verified and account created successfully"
      )
    )
  }

  // Check for unverified permanent account
  const player = await PlayerAuth.findOne({
    email,
    isVerified: false,
    "otp.expiresAt": { $gt: new Date() },
  })

  if (!player) {
    throw new ApiError(404, "No pending verification found or OTP expired")
  }

  // Validate OTP
  if (player.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP")
  }

  // Mark as verified and clear OTP
  player.isVerified = true
  player.otp = undefined
  await player.save({ validateBeforeSave: false })

  // Send welcome email
  await sendWelcomeEmail(player.email, player.name)

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        verified: true,
        accountCreated: false,
      },
      "Email verified successfully"
    )
  )
})

/**
 * Controller for player login with email & password
 */
const loginPlayer = asyncHandler(async (req, res) => {
  // 1. Extract login credentials
  const { email, password } = req.body

  // 2. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }

  // 3. Find player
  const player = await PlayerAuth.findOne({ email })

  if (!player) {
    throw new ApiError(404, "Player not found with this email")
  }
  console.log("Player found successfully")

  // 4. Verify password with better debugging
  try {
    const isPasswordValid = await player.isPasswordCorrect(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        Error: "Invalid email or password",
      })
    }

    // 5. Check if account is verified
    if (!player.isVerified) {
      // Generate and save new OTP
      const { otp, expiryTime } = generateOTP()

      player.otp = {
        code: otp,
        expiresAt: expiryTime,
      }
      await player.save({ validateBeforeSave: false })

      // Send OTP email
      await sendVerificationEmail(email, otp)

      // Return 200 status with verification required flag instead of throwing 403 error
      return res.status(200).json(
        new ApiResponse(
          200,
          { 
            requiresVerification: true,
            email: email,
            message: "Account not verified. A new verification code has been sent to your email"
          },
          "Please verify your email to complete login"
        )
      )
    }

    // 6. Generate tokens
    const { accessToken, refreshToken } = generateTokens(player)

    // 7. Save refresh token in database
    player.refreshToken = refreshToken
    await player.save({ validateBeforeSave: false })

    // 8. Send response with tokens and player data
    const playerData = {
      _id: player._id,
      name: player.name,
      email: player.email,
      username: player.username,
      uid: player.uid,
      profilePicture: player.profilePicture,
      rank: player.rank,
      level: player.level,
      stats: player.stats,
      isVerified: player.isVerified,
      userType: "player",
    }

    // 9. Set cookies and send response
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            player: playerData,
            accessToken,
            refreshToken,
          },
          "Player logged in successfully"
        )
      )
  } catch (error) {
    console.error("Error during password verification:", error)
    throw new ApiError(500, "Internal server error during login")
  }
})

/**
 * Controller for initiating password reset
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  // Check player exists
  const player = await PlayerAuth.findOne({ email })

  if (!player) {
    throw new ApiError(404, "Player not found with this email")
  }

  // Generate OTP instead of reset token
  const { otp, expiryTime } = generateOTP()

  // Save OTP to player
  player.otp = {
    code: otp,
    expiresAt: expiryTime,
  }
  await player.save({ validateBeforeSave: false })

  try {
    // Send OTP email
    await sendVerificationEmail(player.email, otp, "Password Reset")

    return res
      .status(200)
      .json(
        new ApiResponse(200, { email }, "Password reset OTP sent to your email")
      )
  } catch (error) {
    // If email sending fails, clear OTP
    player.otp = undefined
    await player.save({ validateBeforeSave: false })

    throw new ApiError(
      500,
      "Error sending password reset OTP. Please try again later."
    )
  }
})

/**
 * Controller to reset password with OTP
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP, and new password are required")
  }

  // Find player by email with active OTP
  const player = await PlayerAuth.findOne({
    email,
    "otp.expiresAt": { $gt: new Date() },
  })

  if (!player) {
    throw new ApiError(404, "Player not found or OTP expired")
  }

  // Verify OTP
  if (player.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP")
  }

  // Update password and clear OTP
  player.password = newPassword
  player.otp = undefined
  await player.save()

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful"))
})

/**
 * Controller for logging out player
 */
const logoutPlayer = asyncHandler(async (req, res) => {
  // Get player from middleware
  const player = req.player

  if (!player) {
    throw new ApiError(401, "Unauthorized request")
  }

  // Clear refresh token in database
  player.refreshToken = undefined
  await player.save({ validateBeforeSave: false })

  // Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Player logged out successfully"))
})

/**
 * Controller to refresh access token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required")
  }

  // Verify refresh token
  const decodedToken = verifyRefreshToken(incomingRefreshToken)

  if (!decodedToken) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  // Find player by id from token
  const player = await PlayerAuth.findById(decodedToken._id)

  if (!player || player.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token or player not found")
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(player)

  // Update refresh token in database
  player.refreshToken = newRefreshToken
  await player.save({ validateBeforeSave: false })

  // Set cookies and send response
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    )
})

/**
 * Controller to change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const player = req.player

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required")
  }

  if (!player) {
    throw new ApiError(401, "Unauthorized request")
  }

  // Find player with password
  const playerWithPassword = await PlayerAuth.findById(player._id)

  // Verify old password
  const isPasswordCorrect =
    await playerWithPassword.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  // Update password
  playerWithPassword.password = newPassword
  await playerWithPassword.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"))
})

/**
 * Controller to get current player profile
 */
const getCurrentPlayer = asyncHandler(async (req, res) => {
  const player = req.player

  if (!player) {
    throw new ApiError(401, "Unauthorized request")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, player, "Player profile fetched successfully"))
})

/**
 * Controller to update player profile
 */
const updatePlayerProfile = asyncHandler(async (req, res) => {
  const player = req.player
  const { name, username, mobileNumber } = req.body

  if (!player) {
    throw new ApiError(401, "Unauthorized request")
  }

  // Build update object with provided fields
  const updateData = {}

  if (name) updateData.name = name
  if (username) {
    // Check if username is already taken by another player
    const existingPlayerWithUsername = await PlayerAuth.findOne({
      username,
      _id: { $ne: player._id },
    })

    if (existingPlayerWithUsername) {
      throw new ApiError(409, "Username is already taken")
    }

    updateData.username = username
  }
  if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber

  // Handle profile image update if provided
  if (req.file) {
    // Get current player to delete old profile picture
    if (player.profilePicture) {
      // Extract public ID from URL and delete from Cloudinary
      await deleteFromCloudinary(player.profilePicture)
    }

    // Upload new image
    const uploadResult = await uploadOnCloudinary(req.file.path)
    if (uploadResult) {
      updateData.profilePicture = uploadResult.url
    }
  }

  // Update player
  const updatedPlayer = await PlayerAuth.findByIdAndUpdate(
    player._id,
    updateData,
    { new: true }
  ).select("-password -refreshToken -otp")

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Profile updated successfully"))
})

/**
 * Controller to update player privacy settings
 */
const updatePrivacySettings = asyncHandler(async (req, res) => {
  const player = req.player
  const { isProfilePublic, showEmail, showMobileNumber } = req.body

  if (!player) {
    throw new ApiError(401, "Unauthorized request")
  }

  // Update privacy settings
  player.privacySettings = {
    isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : player.privacySettings?.isProfilePublic || true,
    showEmail: showEmail !== undefined ? showEmail : player.privacySettings?.showEmail || false,
    showMobileNumber: showMobileNumber !== undefined ? showMobileNumber : player.privacySettings?.showMobileNumber || false
  }

  await player.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, 
      { privacySettings: player.privacySettings }, 
      "Privacy settings updated successfully"))
})

export {
  registerPlayer,
  verifyEmail,
  resendOtp,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutPlayer,
  refreshAccessToken,
  getCurrentPlayer,
  updatePlayerProfile,
  loginPlayer,
  updatePrivacySettings
}
