import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const MatchManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState({
    tournaments: true,
    players: false,
    matches: false,
    form: false
  });
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'view'

  const [formData, setFormData] = useState({
    matchNumber: '',
    player1: '',
    player2: '',
    startTime: '',
    round: '',
    location: '',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  // Fetch matches when a tournament is selected
  useEffect(() => {
    if (selectedTournament) {
      fetchPlayers();
      if (activeTab === 'view') {
        fetchMatches();
      }
    }
  }, [selectedTournament, activeTab]);

  const fetchTournaments = async () => {
    try {
      setLoading({ ...loading, tournaments: true });
      const response = await axios.get(`${API_URL}/tournaments`);
      setTournaments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to fetch tournaments');
    } finally {
      setLoading({ ...loading, tournaments: false });
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading({ ...loading, players: true });
      // This API endpoint should be implemented to return registered players for a tournament
      const response = await axios.get(`${API_URL}/tournaments/${selectedTournament}/players`);
      setPlayers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to fetch players');
    } finally {
      setLoading({ ...loading, players: false });
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading({ ...loading, matches: true });
      const response = await axios.get(`${API_URL}/matches/tournament/${selectedTournament}`);
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch matches');
    } finally {
      setLoading({ ...loading, matches: false });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTournamentChange = (e) => {
    setSelectedTournament(e.target.value);
    // Reset form data when tournament changes
    setFormData({
      ...formData,
      matchNumber: '',
      player1: '',
      player2: '',
      round: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTournament) {
      toast.error('Please select a tournament');
      return;
    }

    // Validate form
    if (!formData.matchNumber || !formData.player1 || !formData.player2 || !formData.startTime || !formData.round) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate that player1 and player2 are different
    if (formData.player1 === formData.player2) {
      toast.error('Player 1 and Player 2 cannot be the same');
      return;
    }

    try {
      setLoading({ ...loading, form: true });

      const payload = {
        ...formData,
        tournamentId: selectedTournament,
        matchNumber: Number(formData.matchNumber),
        round: Number(formData.round)
      };

      // Make API call
      const response = await axios.post(`${API_URL}/matches/create`, payload);
      
      toast.success('Match created successfully');
      
      // Reset form except for tournament selection
      setFormData({
        matchNumber: '',
        player1: '',
        player2: '',
        startTime: '',
        round: '',
        location: '',
        notes: ''
      });
      
      // If in view tab, refresh matches
      if (activeTab === 'view') {
        fetchMatches();
      }
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(error.response?.data?.message || 'Failed to create match');
    } finally {
      setLoading({ ...loading, form: false });
    }
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to update match status
  const updateMatchStatus = async (matchId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/matches/${matchId}`, {
        status: newStatus
      });
      toast.success(`Match ${newStatus}`);
      fetchMatches();
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error('Failed to update match status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Match Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Create Match
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            View Matches
          </button>
        </div>
      </div>

      {/* Tournament Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Tournament*
        </label>
        <select
          name="tournament"
          value={selectedTournament}
          onChange={handleTournamentChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading.tournaments}
          required
        >
          <option value="">Select a tournament</option>
          {tournaments.map((tournament) => (
            <option key={tournament._id} value={tournament._id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create Match Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Number*
              </label>
              <input
                type="number"
                name="matchNumber"
                value={formData.matchNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter match number"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Round*
              </label>
              <input
                type="number"
                name="round"
                value={formData.round}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter round number"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 1*
              </label>
              <select
                name="player1"
                value={formData.player1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedTournament || loading.players}
                required
              >
                <option value="">Select player 1</option>
                {players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name || player.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 2*
              </label>
              <select
                name="player2"
                value={formData.player2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedTournament || loading.players}
                required
              >
                <option value="">Select player 2</option>
                {players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name || player.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time*
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter match location"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes"
                rows="2"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading.form || !selectedTournament}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium ${
                loading.form || !selectedTournament ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading.form ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      )}

      {/* View Matches Table */}
      {activeTab === 'view' && (
        <div>
          {loading.matches ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No matches found for this tournament
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Round
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match) => (
                    <tr key={match._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {match.matchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {match.round}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{match.player1?.name || 'Player 1'}</span>
                          <span className="text-xs text-gray-400">vs</span>
                          <span>{match.player2?.name || 'Player 2'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(match.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            match.status
                          )}`}
                        >
                          {match.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {match.status === 'scheduled' && (
                            <button
                              onClick={() => updateMatchStatus(match._id, 'ongoing')}
                              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-md"
                            >
                              Start
                            </button>
                          )}
                          {match.status === 'ongoing' && (
                            <button
                              onClick={() => updateMatchStatus(match._id, 'completed')}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-md"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Implement the edit match functionality
                              navigate(`/admin/matches/edit/${match._id}`);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchManagement;