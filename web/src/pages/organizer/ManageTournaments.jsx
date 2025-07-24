import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiChevronRight, FiChevronDown, FiUpload } from 'react-icons/fi';

const ManageTournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTournamentId, setExpandedTournamentId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // 'details', 'winners', 'matches'
  const [isEditing, setIsEditing] = useState(false);
  
  // States for editing tournament
  const [editTournament, setEditTournament] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // States for adding winners
  const [winnersData, setWinnersData] = useState([
    { position: 1, teamId: '', prize: 0 },
    { position: 2, teamId: '', prize: 0 },
    { position: 3, teamId: '', prize: 0 }
  ]);
  
  // States for adding match records
  const [matchData, setMatchData] = useState({
    matchNumber: 1,
    description: '',
    images: []
  });
  const [matchImages, setMatchImages] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  useEffect(() => {
    fetchTournaments();
  }, [user]);
  
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tournaments/organizer/tournaments`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setTournaments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error(error.response?.data?.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandTournament = (tournamentId) => {
    if (expandedTournamentId === tournamentId) {
      setExpandedTournamentId(null);
      setExpandedSection(null);
    } else {
      setExpandedTournamentId(tournamentId);
      setExpandedSection('details');
      
      // Load tournament data for editing
      const tournament = tournaments.find(t => t._id === tournamentId);
      if (tournament) {
        setEditTournament({
          ...tournament,
          startDate: tournament.startDate ? format(new Date(tournament.startDate), 'yyyy-MM-dd') : '',
        });
      }
    }
  };
  
  const handleSectionToggle = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTournament(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateTournament = async () => {
    try {
      setEditLoading(true);
      
      // Prepare tournament data
      const tournamentData = {
        ...editTournament,
        startDate: editTournament.startDate,
        maxTeams: Number(editTournament.maxTeams),
        entryFee: Number(editTournament.entryFee),
        prizePool: Number(editTournament.prizePool),
      };
      
      delete tournamentData._id;
      delete tournamentData.createdAt;
      delete tournamentData.updatedAt;
      delete tournamentData.registeredTeams;
      delete tournamentData.winners;
      delete tournamentData.matches;
      
      // Send update request
      await axios.put(
        `${API_URL}/tournaments/${expandedTournamentId}`,
        tournamentData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      toast.success('Tournament updated successfully');
      fetchTournaments();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating tournament:", error);
      toast.error(error.response?.data?.message || 'Failed to update tournament');
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleWinnerChange = (index, field, value) => {
    const newWinnersData = [...winnersData];
    newWinnersData[index][field] = value;
    setWinnersData(newWinnersData);
  };
  
  const handleSaveWinners = async () => {
    try {
      setEditLoading(true);
      
      // Filter out winners with no team selected
      const validWinners = winnersData.filter(w => w.teamId);
      
      if (validWinners.length === 0) {
        toast.error('Please select at least one winner');
        return;
      }
      
      // Send update request
      await axios.post(
        `${API_URL}/tournaments/${expandedTournamentId}/winners`,
        { winners: validWinners },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      toast.success('Tournament winners updated successfully');
      fetchTournaments();
    } catch (error) {
      console.error("Error updating winners:", error);
      toast.error(error.response?.data?.message || 'Failed to update winners');
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleMatchChange = (e) => {
    const { name, value } = e.target;
    setMatchData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTeamScoreChange = (index, field, value) => {
    const newTeams = [...matchData.teams];
    newTeams[index][field] = value;
    setMatchData(prev => ({
      ...prev,
      teams: newTeams
    }));
  };
  
  const handleAddTeamToMatch = () => {
    setMatchData(prev => ({
      ...prev,
      teams: [...prev.teams, { teamId: '', score: 0 }]
    }));
  };
  
  const handleRemoveTeamFromMatch = (index) => {
    const newTeams = [...matchData.teams];
    newTeams.splice(index, 1);
    setMatchData(prev => ({
      ...prev,
      teams: newTeams
    }));
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setMatchImages(prev => [...prev, ...files]);
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...matchImages];
    newImages.splice(index, 1);
    setMatchImages(newImages);
  };
  
  const handleSaveMatch = async () => {
    try {
      setEditLoading(true);
      
      // Validate match data
      if (!matchData.matchNumber) {
        toast.error('Please provide a match number');
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Add match data
      formData.append('matchNumber', matchData.matchNumber);
      formData.append('title', `Match ${matchData.matchNumber}`); // Auto-generate title
      formData.append('description', matchData.description || '');
      formData.append('date', new Date().toISOString()); // Current date
      formData.append('status', 'completed'); // Default status
      formData.append('teams', JSON.stringify([])); // Empty teams array
      
      // Add images
      matchImages.forEach((image) => {
        formData.append('images', image);
      });
      
      // Send update request
      await axios.post(
        `${API_URL}/tournaments/${expandedTournamentId}/matches`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast.success('Match record added successfully');
      fetchTournaments();
      
      // Reset match data
      setMatchData({
        matchNumber: matchData.matchNumber + 1,
        description: ''
      });
      setMatchImages([]);
    } catch (error) {
      console.error("Error adding match record:", error);
      toast.error(error.response?.data?.message || 'Failed to add match record');
    } finally {
      setEditLoading(false);
    }
  };
  
  const deleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/tournaments/${tournamentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      toast.success('Tournament deleted successfully');
      fetchTournaments();
      
      // Reset states if the deleted tournament was expanded
      if (expandedTournamentId === tournamentId) {
        setExpandedTournamentId(null);
        setExpandedSection(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast.error(error.response?.data?.message || 'Failed to delete tournament');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tournaments</h1>
      </div>
      
      {tournaments.length === 0 ? (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-lg text-blue-800">You haven't created any tournaments yet.</p>
          <button
            onClick={() => window.location.href = '/organizer/create-tournament'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Your First Tournament
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Tournament Header with Banner Image */}
              <div className="relative">
                {tournament.bannerImage ? (
                  <img 
                    src={tournament.bannerImage.url} 
                    alt={tournament.title} 
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{tournament.title}</h3>
                  </div>
                )}
                <div className="absolute top-0 right-0 m-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    tournament.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                    tournament.status === 'open' ? 'bg-green-500 text-white' :
                    tournament.status === 'ongoing' ? 'bg-blue-500 text-white' :
                    tournament.status === 'completed' ? 'bg-purple-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Tournament Info */}
              <div 
                onClick={() => handleExpandTournament(tournament._id)}
                className="p-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 font-mono mr-2">#{tournament.tournamentNumber || '–'}</span>
                    <h3 className="text-lg font-semibold">{tournament.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTournament(tournament._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full mr-2"
                      title="Delete tournament"
                    >
                      <FiTrash2 />
                    </button>
                    {expandedTournamentId === tournament._id ? (
                      <FiChevronDown className="w-5 h-5" />
                    ) : (
                      <FiChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{tournament.game} • {format(new Date(tournament.startDate), 'MMM d, yyyy')}</p>
                
                {/* Tournament Stats in a grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Teams</p>
                    <p className="text-lg font-bold">{tournament.registeredTeams?.length || 0} / {tournament.maxTeams}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Prize Pool</p>
                    <p className="text-lg font-bold">₹{tournament.prizePool || '0'}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Entry Fee</p>
                    <p className="text-lg font-bold">₹{tournament.entryFee || '0'}</p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium">Team Size</p>
                    <p className="text-lg font-bold">{tournament.teamSize || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Expanded Tournament Content */}
              {expandedTournamentId === tournament._id && (
                <div className="border-t border-gray-200">
                  {/* Navigation Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => handleSectionToggle('details')}
                      className={`px-4 py-2 ${expandedSection === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
                    >
                      Tournament Details
                    </button>
                    <button
                      onClick={() => handleSectionToggle('winners')}
                      className={`px-4 py-2 ${expandedSection === 'winners' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
                    >
                      Winners
                    </button>
                    <button
                      onClick={() => handleSectionToggle('matches')}
                      className={`px-4 py-2 ${expandedSection === 'matches' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
                    >
                      Match Records
                    </button>
                  </div>
                  
                  {/* Tournament Details Section */}
                  {expandedSection === 'details' && (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Tournament Details</h4>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className={`text-sm px-3 py-1 rounded ${isEditing ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'}`}
                        >
                          {isEditing ? 'Cancel' : 'Edit Details'}
                        </button>
                      </div>
                      
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              value={editTournament?.title || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Game</label>
                            <input
                              type="text"
                              name="game"
                              value={editTournament?.game || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                              type="date"
                              name="startDate"
                              value={editTournament?.startDate || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <input
                              type="time"
                              name="startTime"
                              value={editTournament?.startTime || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Max Teams</label>
                            <input
                              type="number"
                              name="maxTeams"
                              value={editTournament?.maxTeams || 0}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                              name="status"
                              value={editTournament?.status || 'draft'}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="open">Open</option>
                              <option value="full">Full</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Entry Fee</label>
                            <input
                              type="number"
                              name="entryFee"
                              value={editTournament?.entryFee || 0}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Prize Pool</label>
                            <input
                              type="number"
                              name="prizePool"
                              value={editTournament?.prizePool || 0}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Platform</label>
                            <select
                              name="platform"
                              value={editTournament?.platform || 'Mobile'}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Mobile">Mobile</option>
                              <option value="PC">PC</option>
                              <option value="Console">Console</option>
                              <option value="Cross-platform">Cross-platform</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Region</label>
                            <input
                              type="text"
                              name="region"
                              value={editTournament?.region || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              name="description"
                              value={editTournament?.description || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="4"
                            ></textarea>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Rules</label>
                            <textarea
                              name="rules"
                              value={editTournament?.rules || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="4"
                            ></textarea>
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <button
                              onClick={handleUpdateTournament}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              disabled={editLoading}
                            >
                              {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Title</p>
                            <p>{tournament.title}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Game</p>
                            <p>{tournament.game}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Start Date & Time</p>
                            <p>{format(new Date(tournament.startDate), 'MMM d, yyyy')} at {tournament.startTime || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Platform</p>
                            <p>{tournament.platform}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Region</p>
                            <p>{tournament.region}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Team Size</p>
                            <p>{tournament.teamSize} {tournament.teamSize === 'other' && tournament.customTeamSize ? `(${tournament.customTeamSize})` : ''}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Entry Fee</p>
                            <p>₹{tournament.entryFee || '0'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Prize Pool</p>
                            <p>₹{tournament.prizePool || '0'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-600">Description</p>
                            <p className="whitespace-pre-line">{tournament.description}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-600">Rules</p>
                            <p className="whitespace-pre-line">{tournament.rules || 'No rules specified'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Winners Section */}
                  {expandedSection === 'winners' && (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Tournament Winners</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Declare the winners of this tournament by selecting teams below:</p>
                        
                        {tournament.registeredTeams && tournament.registeredTeams.length > 0 ? (
                          <div className="space-y-4">
                            {winnersData.map((winner, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-1">
                                  <span className="font-bold">{winner.position}</span>
                                </div>
                                <div className="col-span-7 md:col-span-8">
                                  <select
                                    value={winner.teamId}
                                    onChange={(e) => handleWinnerChange(index, 'teamId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select Team</option>
                                    {tournament.registeredTeams.map((team) => (
                                      <option key={team._id} value={team._id}>{team.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-span-4 md:col-span-3">
                                  <div className="flex items-center">
                                    <span className="mr-2">₹</span>
                                    <input
                                      type="number"
                                      value={winner.prize}
                                      onChange={(e) => handleWinnerChange(index, 'prize', Number(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      min="0"
                                      placeholder="Prize"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex justify-end">
                              <button
                                onClick={handleSaveWinners}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={editLoading}
                              >
                                {editLoading ? 'Saving...' : 'Save Winners'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded">
                            <p className="text-yellow-800">No teams have registered for this tournament yet.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Display Current Winners if any */}
                      {tournament.winners && tournament.winners.length > 0 && (
                        <div className="mt-8">
                          <h5 className="text-md font-semibold mb-2">Current Winners</h5>
                          <div className="bg-gray-50 p-4 rounded">
                            <div className="grid grid-cols-12 gap-2 font-semibold border-b pb-2 mb-2">
                              <div className="col-span-1">Pos</div>
                              <div className="col-span-7 md:col-span-8">Team</div>
                              <div className="col-span-4 md:col-span-3">Prize</div>
                            </div>
                            {tournament.winners.sort((a, b) => a.position - b.position).map((winner) => (
                              <div key={winner._id} className="grid grid-cols-12 gap-2 py-2 border-b last:border-0">
                                <div className="col-span-1">{winner.position}</div>
                                <div className="col-span-7 md:col-span-8">{winner.team?.name || 'Unknown Team'}</div>
                                <div className="col-span-4 md:col-span-3">₹{winner.prize}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Match Records Section */}
                  {expandedSection === 'matches' && (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Match Records</h4>
                      </div>
                      
                      {/* Form to add new match record */}
                      <div className="bg-gray-50 p-4 rounded mb-6">
                        <h5 className="text-md font-semibold mb-3">Add New Match Record</h5>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Match Number*</label>
                            <input
                              type="number"
                              name="matchNumber"
                              value={matchData.matchNumber}
                              onChange={handleMatchChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="1"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                            <textarea
                              name="description"
                              value={matchData.description}
                              onChange={handleMatchChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Add any notes about this match..."
                            ></textarea>
                          </div>
                          
                          {/* Image Upload */}
                          <div>
                            <label className="block text-sm font-medium mb-1">Match Images*</label>
                            <div className="flex items-center space-x-2">
                              <label className="px-4 py-2 bg-gray-50 text-gray-700 rounded border border-gray-300 cursor-pointer hover:bg-gray-100">
                                <FiUpload className="inline mr-2" />
                                Upload Images
                                <input
                                  type="file"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  accept="image/*"
                                />
                              </label>
                              <span className="text-xs text-gray-500">{matchImages.length} files selected</span>
                            </div>
                            
                            {/* Preview Images */}
                            {matchImages.length > 0 && (
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                                {matchImages.map((image, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={URL.createObjectURL(image)}
                                      alt={`Preview ${index}`}
                                      className="h-24 w-full object-cover rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <FiX size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-2">
                            <button
                              type="button"
                              onClick={handleSaveMatch}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              disabled={editLoading || matchImages.length === 0}
                            >
                              {editLoading ? 'Saving...' : 'Save Match Record'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Display Match Records */}
                      {tournament.matches && tournament.matches.length > 0 ? (
                        <div className="space-y-4">
                          {tournament.matches.sort((a, b) => a.matchNumber - b.matchNumber).map((match) => (
                            <div key={match._id} className="bg-white border rounded-lg shadow-sm">
                              <div className="p-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-semibold">Match #{match.matchNumber}</h5>
                                </div>
                                
                                {match.description && (
                                  <p className="text-sm mt-2">{match.description}</p>
                                )}
                                
                                {/* Images */}
                                {match.images && match.images.length > 0 && (
                                  <div className="mt-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {match.images.map((image, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={image.url}
                                            alt={`Match image ${index + 1}`}
                                            className="h-40 w-full object-cover rounded"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded text-center">
                          <p className="text-gray-600">No match records have been added yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTournaments;