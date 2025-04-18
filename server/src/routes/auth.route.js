import express from 'express';
import { initiateOtpAuth, verifyOtp, resendOTP, logout, refreshToken } from '../controllers/auth.controller.js';
import { authMiddleware, playerAuthMiddleware, organizerAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/initiate-otp-auth', initiateOtpAuth);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOTP);
router.post('/refresh-token', refreshToken);

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
router.post('/logout', authMiddleware, logout);

// User type specific routes
router.get('/player/check-auth', playerAuthMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Player authenticated',
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        uid: req.user.uid,
        userType: req.user.userType
      }
    }
  });
});

router.get('/organizer/check-auth', organizerAuthMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Organizer authenticated',
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        companyName: req.user.companyName,
        userType: req.user.userType,
        isApproved: req.user.isApproved
      }
    }
  });
});

export default router; 