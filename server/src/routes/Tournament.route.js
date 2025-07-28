import express from 'express';
import {
  createTournament,
  updateTournament,
  deleteTournament,
  getOrganizerTournaments,
  getAllTournaments,
  getTournamentById,
  registerTeamForTournament,
  registerTeamByOrganizer,
  processPayment,
  getTournamentTeams,
  getMyTeams,
  addTournamentWinners,
  addMatchRecord,
  updateMatchRecord,
  deleteMatchRecord,
  updateTeamPaymentStatus
} from '../controllers/tournament.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { organizerMiddleware } from '../middlewares/organizer.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllTournaments);
router.get('/:tournamentId', getTournamentById);
router.get('/:tournamentId/teams', getTournamentTeams);

// Player-only routes (require player authentication)
router.use('/player', authMiddleware);
router.post('/:tournamentId/register', authMiddleware, registerTeamForTournament);
router.post('/teams/:teamId/payment', authMiddleware, processPayment);
router.get('/my-teams', authMiddleware, getMyTeams);

// Admin routes for tournament management
router.put('/admin/:tournamentId', adminMiddleware, upload.single('bannerImage'), updateTournament);
router.delete('/admin/:tournamentId', adminMiddleware, deleteTournament);
router.post('/admin/create', adminMiddleware, upload.single('bannerImage'), createTournament);

// Organizer-only routes (require organizer authentication)
router.use('/organizer', organizerMiddleware);
// Add multer middleware for file uploads
router.post('/', organizerMiddleware, upload.single('bannerImage'), createTournament);
router.get('/organizer/tournaments', organizerMiddleware, getOrganizerTournaments);
router.put('/:tournamentId', organizerMiddleware, upload.single('bannerImage'), updateTournament);
router.delete('/:tournamentId', organizerMiddleware, deleteTournament);

// Team registration and payment management routes for organizers
router.post('/register-team/organizer', organizerMiddleware, upload.single('paymentReceipt'), registerTeamByOrganizer);
router.patch('/:tournamentId/teams/:teamId/payment-status', organizerMiddleware, updateTeamPaymentStatus);
 
// New routes for winners and match records management
router.post('/:tournamentId/winners', organizerMiddleware, addTournamentWinners);
router.post('/:tournamentId/matches', organizerMiddleware, upload.array('images'), addMatchRecord);
router.put('/:tournamentId/matches/:matchId', organizerMiddleware, upload.array('images'), updateMatchRecord);
router.delete('/:tournamentId/matches/:matchId', organizerMiddleware, deleteMatchRecord);

export default router;