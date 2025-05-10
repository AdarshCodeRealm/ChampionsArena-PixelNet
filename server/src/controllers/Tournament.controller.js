import { ApiResponse } from '../utils/ApiResponse.js';
import tournamentService from '../services/tournament.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get a single tournament by ID
 * @route GET /api/v1/tournaments/:id
 * @access Public
 */
export const getTournamentById = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    
    if (!tournamentId) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Tournament ID is required')
      );
    }

    const tournament = await tournamentService.getTournamentById(tournamentId);
    
    return res.status(200).json(
      new ApiResponse(200, tournament, 'Tournament fetched successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Get all tournaments
 * @route GET /api/v1/tournaments
 * @access Public
 */
export const getAllTournaments = async (req, res) => {
  try {
    const { page, limit, status, game, sort, order } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      game,
      sort: sort || 'updatedAt',
      order: order || 'desc'
    };
    
    const result = await tournamentService.getAllTournaments(options);
    
    return res.status(200).json(
      new ApiResponse(200, result, 'Tournaments fetched successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Create a new tournament
 * @route POST /api/v1/tournaments
 * @access Private (Organizers only)
 */
export const createTournament = async (req, res) => {
  try {
    // Get organizer ID from authenticated user
    console.log("handle")
    const organizerId = req.user._id;
    // Process banner image if uploaded
    let bannerImage = req.body.bannerImage;
    if (req.file) {
      // In a real implementation, upload the file to a storage service
      // This is a simplified example assuming file storage is handled elsewhere
      bannerImage = `/uploads/tournaments/${req.file.filename}`;
    }
    
    // Create tournament with organizer information
    const tournamentData = {
      ...req.body,
      bannerImage
    };
    
    const tournament = await tournamentService.createTournament(tournamentData, organizerId);
    
    return res.status(201).json(
      new ApiResponse(201, tournament, 'Tournament created successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Update an existing tournament
 * @route PUT /api/v1/tournaments/:id
 * @access Private (Tournament owner only)
 */
export const updateTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const organizerId = req.user._id;
    
    // Process banner image if uploaded
    let updateData = { ...req.body };
    if (req.file) {
      // In a real implementation, upload the file to a storage service
      updateData.bannerImage = `/uploads/tournaments/${req.file.filename}`;
    }
    
    const tournament = await tournamentService.updateTournament(
      tournamentId, 
      updateData, 
      organizerId
    );
    
    return res.status(200).json(
      new ApiResponse(200, tournament, 'Tournament updated successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Delete a tournament
 * @route DELETE /api/v1/tournaments/:id
 * @access Private (Tournament owner only)
 */
export const deleteTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const organizerId = req.user._id;
    
    await tournamentService.deleteTournament(tournamentId, organizerId);
    
    return res.status(200).json(
      new ApiResponse(200, null, 'Tournament deleted successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

/**
 * Get tournaments created by the authenticated organizer
 * @route GET /api/v1/tournaments/organizer
 * @access Private (Organizers only)
 */
export const getOrganizerTournaments = async (req, res) => {
  try {
    const organizerId = req.user._id;
    
    const tournaments = await tournamentService.getOrganizerTournaments(organizerId);
    
    return res.status(200).json(
      new ApiResponse(200, tournaments, 'Organizer tournaments fetched successfully')
    );
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'Server error';
    
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
};

