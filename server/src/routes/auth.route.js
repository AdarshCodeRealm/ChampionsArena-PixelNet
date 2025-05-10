import express from 'express';
import { initiateOtpAuth, verifyOtp, resendOTP, logout, refreshToken, loginWithOtp } from '../controllers/auth.controller.js';
import { authMiddleware as isAuthenticated, playerAuthMiddleware, organizerAuthMiddleware } from '../middlewares/auth.middleware.js';
// import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { isApprovedOrganizer } from '../middlewares/organizer.middleware.js';

const router = express.Router();

// Public routes
router.post('/initiate-otp-auth', initiateOtpAuth);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOTP);
router.post('/refresh-token', refreshToken);
router.post('/login-with-otp', loginWithOtp);
// Type-specific auth routes (for simplified client implementation)
router.post('/player/initiate-otp-auth', (req, res, next) => {
  req.body.userType = 'player';
  initiateOtpAuth(req, res, next);
});

router.post('/organizer/initiate-otp-auth', (req, res, next) => {
  req.body.userType = 'organizer';
  initiateOtpAuth(req, res, next);
});

// Protected routes
router.post('/logout', isAuthenticated, logout);

// User type specific routes
router.get('/player/check-auth', isAuthenticated, (req, res) => {
  if (req.user.userType !== 'player') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Player route only.'
    });
  }
  res.status(200).json({
    success: true,
    message: 'Player authenticated',
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        userType: req.user.userType,
        isVerified: req.user.isVerified
      }
    }
  });
});

router.get('/organizer/check-auth', isAuthenticated, isApprovedOrganizer, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Organizer authenticated',
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        companyName: req.organizer.companyName,
        userType: req.user.userType,
        isApproved: req.organizer.isApproved,
        isVerified: req.user.isVerified
      }
    }
  });
});

// Auth routes
router.post('/login', authController.login);
router.post('/verify-login', authController.verifyLogin);
router.post('/send-signup-otp', authController.sendSignupOTP);
router.post('/verify-signup', authController.verifySignup);
router.post('/logout', authController.logout);

export default router; 