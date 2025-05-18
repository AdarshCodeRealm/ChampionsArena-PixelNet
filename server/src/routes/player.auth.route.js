import express from 'express';
import {
  registerPlayer,
  loginPlayer,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutPlayer,
  refreshAccessToken,
  changePassword,
  getCurrentPlayer,
  updatePlayerProfile
} from '../controllers/player.auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public routes
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route'
  });
});
router.post('/register', upload.single('profilePicture'), registerPlayer);
router.post('/login', loginPlayer);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshAccessToken);

// Protected routes - require authentication
router.use(authMiddleware); // Apply auth middleware to all routes below

router.post('/logout', logoutPlayer);
router.get('/me', getCurrentPlayer);
router.put('/change-password', changePassword);
router.put('/update-profile', upload.single('profilePicture'), updatePlayerProfile);

export default router;