import express from 'express';
import { authMiddleware, playerAuthMiddleware, organizerAuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  getUserProfile,
  updateUserProfile,
  updateAccountSettings,
  changePassword,
  uploadProfilePicture,
  deleteAccount
} from '../controllers/user.controller.js';

const router = express.Router();

// Common routes with auth middleware
router.post('/upload-profile-picture', authMiddleware, uploadProfilePicture);

// Player-specific routes
router.get('/player/profile', playerAuthMiddleware, (req, res, next) => {
  req.userType = 'player';
  getUserProfile(req, res, next);
});

router.put('/player/profile', playerAuthMiddleware, (req, res, next) => {
  req.userType = 'player';
  updateUserProfile(req, res, next);
});

router.put('/player/settings', playerAuthMiddleware, (req, res, next) => {
  req.userType = 'player';
  updateAccountSettings(req, res, next);
});

router.put('/player/password', playerAuthMiddleware, (req, res, next) => {
  req.userType = 'player';
  changePassword(req, res, next);
});

router.delete('/player/account', playerAuthMiddleware, (req, res, next) => {
  req.userType = 'player';
  deleteAccount(req, res, next);
});

// Organizer-specific routes
router.get('/organizer/profile', organizerAuthMiddleware, (req, res, next) => {
  req.userType = 'organizer';
  getUserProfile(req, res, next);
});

router.put('/organizer/profile', organizerAuthMiddleware, (req, res, next) => {
  req.userType = 'organizer';
  updateUserProfile(req, res, next);
});

router.put('/organizer/settings', organizerAuthMiddleware, (req, res, next) => {
  req.userType = 'organizer';
  updateAccountSettings(req, res, next);
});

router.put('/organizer/password', organizerAuthMiddleware, (req, res, next) => {
  req.userType = 'organizer';
  changePassword(req, res, next);
});

router.delete('/organizer/account', organizerAuthMiddleware, (req, res, next) => {
  req.userType = 'organizer';
  deleteAccount(req, res, next);
});

export default router; 