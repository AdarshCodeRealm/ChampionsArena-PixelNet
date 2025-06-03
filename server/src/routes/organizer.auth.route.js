import express from 'express';
import {
  registerOrganizer,
  verifyOTP,
  loginOrganizer,
  refreshAccessToken,
  logoutOrganizer,
  updateProfile,
  getCurrentOrganizer
} from '../controllers/organizer.auth.controller.js';
import { organizerMiddleware } from '../middlewares/organizer.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', 
  upload.fields([
    { name: 'aadharImage', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
  ]), 
  registerOrganizer
);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginOrganizer);
router.post('/refresh-token', refreshAccessToken);

// Protected routes (require authentication)
router.post('/logout', organizerMiddleware, logoutOrganizer);
router.get('/me', organizerMiddleware, getCurrentOrganizer);
router.patch('/profile', organizerMiddleware, upload.single('profilePicture'), updateProfile);

export default router;