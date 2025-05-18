import PlayerAuth from '../models/playerAuth.model.js';
import { verifyToken } from '../utils/token.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header OR cookie
    let token;
    const authHeader = req.headers.authorization;
    
    // First check Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // If not in header, check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    // If no token found in either place
    if (!token) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: No token provided")
      );
    }
    
    // Verify token
    const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    
    if (!decoded) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Invalid or expired token")
      );
    }
    
    // Find player
    const player = await PlayerAuth.findById(decoded._id).select("-password -otp -otpExpiry");
    
    if (!player) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Player not found")
      );
    }
    
    // Check if player is verified
    if (!player.isVerified) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Account not verified")
      );
    }
    
    // Attach player to request
    req.player = player;
    next();
    
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
};