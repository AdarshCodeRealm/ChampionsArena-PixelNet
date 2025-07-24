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
    
    // Attach admin to request with role information
    req.admin = admin;
    req.userRole = admin.role; // Add role for easier access
    next();
    
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authentication")
    );
  }
};

// Check if user is an admin (regular admin or super-admin)
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Authentication required")
      );
    }
    
    if (req.admin.role !== 'admin' && req.admin.role !== 'super-admin') {
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

// Middleware specifically for super admins only
export const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json(
        new ApiResponse(401, null, "Unauthorized: Authentication required")
      );
    }
    
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json(
        new ApiResponse(403, null, "Forbidden: Super Admin access required")
      );
    }
    
    next();
  } catch (error) {
    console.error("isSuperAdmin middleware error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error during authorization")
    );
  }
};