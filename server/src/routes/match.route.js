import express from "express";
const router = express.Router();

import {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  updateMatchResults,
  deleteMatch
} from "../controllers/match.controller.js";

import {authMiddleware as verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin, isAdminOrSuperAdmin } from "../middlewares/admin.middleware.js";
import { organizerMiddleware as isOrganizer } from "../middlewares/organizer.middleware.js";

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Create match - Admin, SuperAdmin, or Organizer can create
router.post(
  "/create",
  (req, res, next) => {
    // Check if user is admin or organizer
    const isAdminUser = req.user.role === "admin" || req.user.role === "superadmin";
    const isOrganizerUser = req.user.role === "organizer";
    
    if (isAdminUser || isOrganizerUser) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: "You are not authorized to create matches"
    });
  },
  createMatch
);

// Get all matches for a specific tournament - Public
router.get("/tournament/:tournamentId", getAllMatches);

// Get match by ID - Public
router.get("/:matchId", getMatchById);

// Update match - Admin, SuperAdmin, or Organizer
router.patch(
  "/:matchId",
  (req, res, next) => {
    // Check if user is admin or organizer
    const isAdminUser = req.user.role === "admin" || req.user.role === "superadmin";
    const isOrganizerUser = req.user.role === "organizer";
    
    if (isAdminUser || isOrganizerUser) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update matches"
    });
  },
  updateMatch
);

// Update match results - Admin, SuperAdmin, or Organizer
router.patch(
  "/:matchId/results",
  (req, res, next) => {
    // Check if user is admin or organizer
    const isAdminUser = req.user.role === "admin" || req.user.role === "superadmin";
    const isOrganizerUser = req.user.role === "organizer";
    
    if (isAdminUser || isOrganizerUser) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update match results"
    });
  },
  updateMatchResults
);

// Delete match - Admin or SuperAdmin only
router.delete("/:matchId", isAdminOrSuperAdmin, deleteMatch);

export default router;