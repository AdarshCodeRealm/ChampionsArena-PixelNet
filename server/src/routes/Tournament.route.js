import express from 'express';
import {
  createTournament,
  updateTournament,
  deleteTournament,
  getOrganizerTournaments,
  getAllTournaments,
  getTournamentById,
  registerTeamForTournament,
  processPayment,
  getTournamentTeams,
  getMyTeams
} from '../controllers/tournament.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { organizerMiddleware } from '../middlewares/organizer.middleware.js';

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

// Organizer-only routes (require organizer authentication)
router.use('/organizer', organizerMiddleware);
router.post('/', organizerMiddleware, createTournament);
router.get('/organizer/tournaments', organizerMiddleware, getOrganizerTournaments);
router.put('/:tournamentId', organizerMiddleware, updateTournament);
router.delete('/:tournamentId', organizerMiddleware, deleteTournament);

export default router;