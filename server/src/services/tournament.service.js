import Tournament from '../models/Tournament.model.js';
import { ApiError } from '../utils/ApiError.js';
import { Organizer } from '../models/organizer.model.js';
import mongoose from 'mongoose';

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

      // Generate tournament number (explicitly get the next counter value)
      const Counter = mongoose.model('Counter');
      const counter = await Counter.findOneAndUpdate(
        { name: 'tournamentNumber' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      
      // Create tournament with organizer information and tournament number
      const tournament = new Tournament({
        ...tournamentData,
        organizer: organizerId,
        organizerName: organizer.name || organizer.companyName,
        upiAddress: organizer.upiAddress || '',
        bannerImage: tournamentData.bannerImage || '',
        tournamentNumber: counter.value // Explicitly set tournament number
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
        order = 'desc',
        populate
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
      let tournamentsQuery = Tournament.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit));
      
      // Populate organizer data if requested
      if (populate === 'organizer') {
        tournamentsQuery = tournamentsQuery.populate('organizer', 'name companyName profilePicture');
      }
      
      const tournaments = await tournamentsQuery;
      
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
        .sort({ updatedAt: -1 })
        .populate('registeredTeams')
        .populate({
          path: 'winners.team',
          model: 'Team',
          select: 'name captain'
        });
        
      return tournaments;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch organizer tournaments");
    }
  }

  /**
   * Adds or updates winners for a tournament
   * @param {String} tournamentId - ID of the tournament
   * @param {Array} winners - Array of winner objects with position, team and prize
   * @param {String} organizerId - ID of the organizer
   * @returns {Promise<Object>} Updated tournament
   * @throws {ApiError} If update fails
   */
  async addTournamentWinners(tournamentId, winners, organizerId) {
    try {
      // Find the tournament and verify ownership
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only update tournaments you created");
      }

      // Update winners
      tournament.winners = winners.map(winner => ({
        position: winner.position,
        team: winner.teamId,
        prize: winner.prize || 0
      }));

      // Save the tournament
      await tournament.save();
      
      return tournament.toPublicJSON();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to update tournament winners");
    }
  }

  /**
   * Adds a match record to a tournament
   * @param {String} tournamentId - ID of the tournament
   * @param {Object} matchData - Match record data
   * @param {String} organizerId - ID of the organizer
   * @returns {Promise<Object>} Added match record
   * @throws {ApiError} If addition fails
   */
  async addMatchRecord(tournamentId, matchData, organizerId) {
    try {
      // Find the tournament and verify ownership
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only update tournaments you created");
      }

      // Check if match number already exists
      if (tournament.matches.some(m => m.matchNumber === matchData.matchNumber)) {
        throw new ApiError(400, `Match #${matchData.matchNumber} already exists in this tournament`);
      }

      // Add match record
      tournament.matches.push(matchData);
      await tournament.save();
      
      // Return the newly added match
      return tournament.matches[tournament.matches.length - 1];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to add match record");
    }
  }

  /**
   * Updates a match record in a tournament
   * @param {String} tournamentId - ID of the tournament
   * @param {String} matchId - ID of the match to update
   * @param {Object} matchData - Updated match data
   * @param {String} organizerId - ID of the organizer
   * @returns {Promise<Object>} Updated match record
   * @throws {ApiError} If update fails
   */
  async updateMatchRecord(tournamentId, matchId, matchData, organizerId) {
    try {
      // Find the tournament and verify ownership
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only update tournaments you created");
      }

      // Find the match in the tournament
      const matchIndex = tournament.matches.findIndex(m => m._id.toString() === matchId);
      if (matchIndex === -1) {
        throw new ApiError(404, "Match record not found");
      }

      // Update match fields
      Object.keys(matchData).forEach(key => {
        if (matchData[key] !== undefined) {
          tournament.matches[matchIndex][key] = matchData[key];
        }
      });

      await tournament.save();
      
      return tournament.matches[matchIndex];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to update match record");
    }
  }

  /**
   * Deletes a match record from a tournament
   * @param {String} tournamentId - ID of the tournament
   * @param {String} matchId - ID of the match to delete
   * @param {String} organizerId - ID of the organizer
   * @returns {Promise<Boolean>} True if deleted
   * @throws {ApiError} If deletion fails
   */
  async deleteMatchRecord(tournamentId, matchId, organizerId) {
    try {
      // Find the tournament and verify ownership
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      if (tournament.organizer.toString() !== organizerId) {
        throw new ApiError(403, "You can only update tournaments you created");
      }

      // Find and remove the match from the tournament
      const matchIndex = tournament.matches.findIndex(m => m._id.toString() === matchId);
      if (matchIndex === -1) {
        throw new ApiError(404, "Match record not found");
      }

      tournament.matches.splice(matchIndex, 1);
      await tournament.save();
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to delete match record");
    }
  }
}

export default new TournamentService();