import express from 'express';
import {
  loginAdmin,
  refreshAccessToken,
  logoutAdmin,
  getPendingOrganizerRequests,
  getOrganizerDetails,
  approveOrganizer,
  rejectOrganizer,
  getApprovedOrganizers,
  getAllPlayers,
  createOrganizerByAdmin
} from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', loginAdmin);
router.post('/refresh-token', refreshAccessToken);

// Protected routes (require authentication)
router.post('/logout', adminMiddleware, logoutAdmin);

// Organizer verification routes
router.get('/organizers/pending', adminMiddleware, getPendingOrganizerRequests);
router.get('/organizers/approved', adminMiddleware, getApprovedOrganizers);
router.get('/organizers/:organizerId', adminMiddleware, getOrganizerDetails);
router.patch('/organizers/:organizerId/approve', adminMiddleware, approveOrganizer);
router.patch('/organizers/:organizerId/reject', adminMiddleware, rejectOrganizer);

// Players routes
router.get('/players', adminMiddleware, getAllPlayers);

// Admin creates organizer directly
router.post('/organizers/create', adminMiddleware, upload.fields([
  { name: 'aadharImage', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]), createOrganizerByAdmin);

export default router;