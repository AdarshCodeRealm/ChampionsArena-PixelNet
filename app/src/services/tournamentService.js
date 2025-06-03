import axios from 'axios';
import { API_URL, DEFAULT_TIMEOUT } from '../config/constants';

/**
 * Service for handling tournament-related operations
 */
class TournamentService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: DEFAULT_TIMEOUT,
    });
  }

  /**
   * Set the authentication token for API requests
   * @param {string} token - JWT authentication token
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get all tournaments with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Tournament data with pagination
   */
  async getAllTournaments(filters = {}) {
    try {
      const { page = 1, limit = 10, status, game, sort, order } = filters;
      
      const response = await this.client.get('/tournaments', {
        params: { page, limit, status, game, sort, order }
      });
      
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch tournaments');
    }
  }

  /**
   * Get a single tournament by ID
   * @param {string} id - Tournament ID
   * @returns {Promise<Object>} Tournament details
   */
  async getTournamentById(id) {
    try {
      const response = await this.client.get(`/tournaments/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch tournament details');
    }
  }

  /**
   * Get tournaments created by the authenticated organizer
   * @returns {Promise<Array>} List of organizer's tournaments
   */
  async getOrganizerTournaments() {
    try {
      const response = await this.client.get('/tournaments/organizer/tournaments');
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch your tournaments');
    }
  }

  /**
   * Create a new tournament
   * @param {Object} tournamentData - Tournament data
   * @param {File} bannerImage - Optional banner image file
   * @returns {Promise<Object>} Created tournament
   */
  async createTournament(tournamentData, bannerImage = null) {
    try {
      let formData;
      
      // If there's a banner image, use FormData to send multipart/form-data
      if (bannerImage) {
        formData = new FormData();
        
        // Add all tournament data to FormData
        Object.keys(tournamentData).forEach(key => {
          formData.append(key, tournamentData[key]);
        });
        
        // Add the banner image
        formData.append('bannerImage', bannerImage);
        console.log("handle 1")
        const response = await this.client.post('/tournaments', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log("handle 2")

        
        return response.data.data;
      } else {
        // No image, send regular JSON
        const response = await this.client.post('/tournaments', tournamentData);
        return response.data.data;
      }
    } catch (error) {
      this.handleError(error, 'Failed to create tournament');
    }
  }

  /**
   * Update an existing tournament
   * @param {string} id - Tournament ID
   * @param {Object} updateData - Data to update
   * @param {File} bannerImage - Optional banner image file
   * @returns {Promise<Object>} Updated tournament
   */
  async updateTournament(id, updateData, bannerImage = null) {
    try {
      let formData;
      
      // If there's a banner image, use FormData to send multipart/form-data
      if (bannerImage) {
        formData = new FormData();
        
        // Add all update data to FormData
        Object.keys(updateData).forEach(key => {
          formData.append(key, updateData[key]);
        });
        
        // Add the banner image
        formData.append('bannerImage', bannerImage);
        
        const response = await this.client.put(`/tournaments/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.data;
      } else {
        // No image, send regular JSON
        const response = await this.client.put(`/tournaments/${id}`, updateData);
        return response.data.data;
      }
    } catch (error) {
      this.handleError(error, 'Failed to update tournament');
    }
  }

  /**
   * Delete a tournament
   * @param {string} id - Tournament ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteTournament(id) {
    try {
      await this.client.delete(`/tournaments/${id}`);
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to delete tournament');
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @throws {Error} Formatted error
   */
  handleError(error, defaultMessage = 'API request failed') {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      const message = error.response.data?.message || defaultMessage;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response received from server. Please try again later.');
    } else {
      // Something happened in setting up the request
      throw new Error(error.message || defaultMessage);
    }
  }
}

export default new TournamentService(); 