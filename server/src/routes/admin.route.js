import express from 'express';
import {
  loginAdmin,
  refreshAccessToken,
  logoutAdmin,
  getPendingOrganizerRequests,
  getOrganizerDetails,
  approveOrganizer,
  rejectOrganizer,
  getApprovedOrganizers
} from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

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

export default router;