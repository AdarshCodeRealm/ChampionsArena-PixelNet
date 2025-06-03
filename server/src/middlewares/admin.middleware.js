import Admin from '../models/admin.model.js';
import { verifyToken } from '../utils/token.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const adminMiddleware = async (req, res, next) => {
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
    
    // Find admin
    const admin = await Admin.findById(decoded._id).select("-password");
    
    if (!admin) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Admin not found")
      );
    }
    
    // Attach admin to request
    req.admin = admin;
    next();
    
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
};

// Middleware to check if user is an admin (any level)
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Authentication required")
      );
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json(
        new ApiResponse(403, null, "Forbidden: Admin access required")
      );
    }
    
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authorization")
    );
  }
};

// Middleware to check if user is an admin or superadmin
export const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Authentication required")
      );
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json(
        new ApiResponse(403, null, "Forbidden: Admin or SuperAdmin access required")
      );
    }
    
    next();
  } catch (error) {
    console.error("isAdminOrSuperAdmin middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authorization")
    );
  }
};