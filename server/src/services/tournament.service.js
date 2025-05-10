import Tournament from '../models/Tournament.model.js';
import { ApiError } from '../utils/ApiError.js';
import { Organizer } from '../models/organizer.model.js';

/**
 * Tournament service to handle all tournament related operations
 */
class TournamentService {
  /**
   * Creates a new tournament
   * @param {Object} tournamentData - New tournament data
   * @param {String} organizerId - ID of the organizer creating the tournament
   * @returns {Promise<Object>} Created tournament
   * @throws {ApiError} If creation fails
   */
  async createTournament(tournamentData, organizerId) {
    try {
      // Check if organizer exists and is approved
      const organizer = await Organizer.findById(organizerId);
      if (!organizer) {
        throw new ApiError(404, "Organizer not found");
      }
      
      if (!organizer.isApproved) {
        throw new ApiError(403, "You need to be an approved organizer to create tournaments");
      }

      // Create tournament with organizer information
      const tournament = new Tournament({
        ...tournamentData,
        organizer: organizerId,
        organizerName: organizer.name || organizer.companyName
      });

      // Save the tournament
      const savedTournament = await tournament.save();
      
      // Add tournament to organizer's tournaments array
      organizer.tournaments.push(savedTournament._id);
      await organizer.save();
      
      return savedTournament.toPublicJSON();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new ApiError(400, error.message);
      }
      throw new ApiError(500, "Failed to create tournament");
    }
  }

  /**
   * Updates an existing tournament
   * @param {String} tournamentId - ID of the tournament to update
   * @param {Object} updateData - Data to update
   * @param {String} organizerId - ID of the organizer updating the tournament
   * @returns {Promise<Object>} Updated tournament
   * @throws {ApiError} If update fails
   */
  async updateTournament(tournamentId, updateData, organizerId) {
    try {
      // Find the tournament
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      // Check if the organizer owns this tournament
      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only update tournaments you created");
      }

      // Update the tournament
      Object.keys(updateData).forEach(key => {
        // Don't allow updating organizer or createdAt
        if (!['organizer', 'createdAt', 'organizerName'].includes(key)) {
          tournament[key] = updateData[key];
        }
      });

      const updatedTournament = await tournament.save();
      return updatedTournament.toPublicJSON();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new ApiError(400, error.message);
      }
      throw new ApiError(500, "Failed to update tournament");
    }
  }

  /**
   * Deletes a tournament
   * @param {String} tournamentId - ID of the tournament to delete
   * @param {String} organizerId - ID of the organizer deleting the tournament
   * @returns {Promise<Boolean>} True if deleted
   * @throws {ApiError} If deletion fails
   */
  async deleteTournament(tournamentId, organizerId) {
    try {
      // Find the tournament
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      // Check if the organizer owns this tournament
      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only delete tournaments you created");
      }

      // Delete the tournament
      await Tournament.findByIdAndDelete(tournamentId);
      
      // Remove tournament from organizer's tournaments array
      await Organizer.findByIdAndUpdate(
        organizerId,
        { $pull: { tournaments: tournamentId } }
      );
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to delete tournament");
    }
  }

  /**
   * Gets all tournaments with pagination and sorting
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Tournaments and count
   * @throws {ApiError} If fetch fails
   */
  async getAllTournaments(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        game,
        sort = 'updatedAt',
        order = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      if (status) query.status = status;
      if (game) query.game = game;
      
      // Sort configuration
      const sortConfig = {};
      sortConfig[sort] = order === 'asc' ? 1 : -1;
      
      // Execute query with pagination and sort
      const tournaments = await Tournament.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('organizer', 'name companyName');
      
      // Get total count
      const total = await Tournament.countDocuments(query);
      
      return {
        data: tournaments.map(t => t.toPublicJSON()),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new ApiError(500, "Failed to fetch tournaments");
    }
  }

  /**
   * Gets a single tournament by ID
   * @param {String} tournamentId - ID of the tournament to fetch
   * @returns {Promise<Object>} Tournament data
   * @throws {ApiError} If fetch fails
   */
  async getTournamentById(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
        .populate('organizer', 'name companyName');
        
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }
      
      return tournament.toPublicJSON();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new ApiError(400, "Invalid tournament ID");
      }
      throw new ApiError(500, "Failed to fetch tournament");
    }
  }

  /**
   * Gets all tournaments created by a specific organizer
   * @param {String} organizerId - ID of the organizer
   * @returns {Promise<Array>} Array of tournaments
   * @throws {ApiError} If fetch fails
   */
  async getOrganizerTournaments(organizerId) {
    try {
      const tournaments = await Tournament.find({ organizer: organizerId })
        .sort({ updatedAt: -1 });
        
      return tournaments.map(t => t.toPublicJSON());
    } catch (error) {
      throw new ApiError(500, "Failed to fetch organizer tournaments");
    }
  }
}

export default new TournamentService(); 