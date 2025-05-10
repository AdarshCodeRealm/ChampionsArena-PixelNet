import { Player } from '../models/player.model.js';
import { Organizer } from '../models/organizer.model.js';
import { verifyToken } from '../utils/token.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: No token provided")
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Invalid token format")
      );
    }
    
    // Verify token
    const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    
    if (!decoded) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Invalid or expired token")
      );
    }
    
    // Determine user type and model
    const userType = decoded.userType || 'player';
    const UserModel = userType === 'organizer' ? Organizer : Player;
    
    // Find user
    const user = await UserModel.findById(decoded._id).select("-password -otp -otpExpiry");
    
    if (!user) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: User not found")
      );
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Account not verified")
      );
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
};

// Middleware to check if the user is a player
export const playerAuthMiddleware = async (req, res, next) => {
  try {
    // First use the regular auth middleware
    authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // Check if user is a player
      if (req.user.userType !== 'player') {
        return res.status(403).json(
          new ApiResponse(403, null, "Forbidden: Player access required")
        );
      }
      next();
    });
  } catch (error) {
    console.error("Player auth middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
};

// Middleware to check if the user is an organizer
export const organizerAuthMiddleware = async (req, res, next) => {
  try {
    console.log("org middle")
    // First use the regular auth middleware
    authMiddleware(req, res, (err) => {
      if (err) return next(err);s
      
      // Check if user is an organizer
      if (req.user.userType !== 'organizer') {
        return res.status(403).json(
          new ApiResponse(403, null, "Forbidden: Organizer access required")
        );
      }
      
      // Check if organizer is approved
      if (!req.user.isApproved) {
        return res.status(403).json(
          new ApiResponse(403, null, "Forbidden: Your organizer account is pending approval")
        );
      }
      
      next();
    });
  } catch (error) {
    console.error("Organizer auth middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
}; 