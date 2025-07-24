import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const MatchManagement = () => {
  const { id } = useParams(); // Tournament ID
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Register Team Form State
  const [teamForm, setTeamForm] = useState({
    name: '',
    captainName: '',
    mobileNumber: '',
    members: ['', '', ''], // Default 3 members, can be adjusted based on team size
    paymentProcessing: false
  });
  
  // Modal states
  const [showRegisterTeamModal, setShowRegisterTeamModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
      fetchTeams();
      fetchMatches();
    }
  }, [id]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/tournaments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTournament(response.data.data);
      
      // Adjust the team member form fields based on team size
      if (response.data.data.teamSize) {
        let size = 4; // Default squad size
        
        if (response.data.data.teamSize === 'solo') {
          size = 1;
        } else if (response.data.data.teamSize === 'duo') {
          size = 2;
        } else if (response.data.data.customTeamSize) {
          size = response.data.data.customTeamSize;
        }
        
        setTeamForm(prev => ({
          ...prev,
          members: Array(size).fill('')
        }));
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch tournament details');
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`/api/v1/tournaments/${id}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`/api/v1/tournaments/${id}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch matches');
    }
  };

  const handleTeamFormChange = (e) => {
    const { name, value } = e.target;
    setTeamForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, value) => {
    const updatedMembers = [...teamForm.members];
    updatedMembers[index] = value;
    setTeamForm(prev => ({ ...prev, members: updatedMembers }));
  };

  const handleRegisterTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamForm.name || !teamForm.captainName || !teamForm.mobileNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate that mobile number is in correct format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(teamForm.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    
    try {
      setTeamForm(prev => ({ ...prev, paymentProcessing: true }));
      
      // Start payment process directly using the payment gateway
      const paymentData = {
        name: teamForm.captainName,
        mobileNumber: teamForm.mobileNumber,
        amount: tournament.entryFee,
        description: `Registration fee for team ${teamForm.name} in tournament ${tournament.title}`
      };
      
      // Initiate payment
      const paymentResponse = await axios.post('/api/v1/payments/initiate', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to payment URL
      if (paymentResponse.data.data.paymentUrl) {
        // Save team data in localStorage to retrieve after payment
        localStorage.setItem('pendingTeamRegistration', JSON.stringify({
          tournamentId: id,
          teamName: teamForm.name,
          captainName: teamForm.captainName,
          mobileNumber: teamForm.mobileNumber,
          members: teamForm.members.filter(member => member.trim() !== ''),
          transactionId: paymentResponse.data.data.transactionId
        }));
        
        window.location.href = paymentResponse.data.data.paymentUrl;
      } else {
        toast.error('Payment initiation failed');
        setTeamForm(prev => ({ ...prev, paymentProcessing: false }));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
      setTeamForm(prev => ({ ...prev, paymentProcessing: false }));
    }
  };

  const createMatch = async (matchData) => {
    try {
      const response = await axios.post(`/api/v1/tournaments/${id}/matches`, matchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Match created successfully');
      fetchMatches(); // Refresh the matches list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create match');
    }
  };

  const updateMatchResult = async (matchId, resultData) => {
    try {
      const response = await axios.patch(`/api/v1/tournaments/${id}/matches/${matchId}`, resultData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Match result updated');
      fetchMatches(); // Refresh the matches list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update match result');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Tournament not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{tournament.title} - Match Management</h1>
      
      {/* Tournament Details */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Tournament Details</h3>
            <p><span className="font-medium">Game:</span> {tournament.game}</p>
            <p><span className="font-medium">Team Size:</span> {tournament.teamSize}</p>
            <p><span className="font-medium">Start Date:</span> {new Date(tournament.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p><span className="font-medium">Entry Fee:</span> ₹{tournament.entryFee}</p>
            <p><span className="font-medium">Prize Pool:</span> ₹{tournament.prizePool}</p>
            <p><span className="font-medium">Status:</span> {tournament.status}</p>
          </div>
        </div>
      </div>
      
      {/* Team Registration Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registered Teams ({teams.length}/{tournament.maxTeams})</h2>
          <button
            onClick={() => setShowRegisterTeamModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={teams.length >= tournament.maxTeams}
          >
            Register New Team
          </button>
        </div>
        
        {/* Teams List */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Team Name</th>
                <th className="py-3 px-6 text-left">Captain</th>
                <th className="py-3 px-6 text-left">Members</th>
                <th className="py-3 px-6 text-left">Registration Date</th>
                <th className="py-3 px-6 text-left">Payment Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {teams.map((team) => (
                <tr key={team._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{team.name}</td>
                  <td className="py-3 px-6 text-left">{team.captain?.username || team.captain?.name || 'N/A'}</td>
                  <td className="py-3 px-6 text-left">
                    {team.members?.length || 0} members
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(team.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      team.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      team.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {team.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center">No teams registered yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Matches Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Matches</h2>
        
        {/* Matches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <div key={match._id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{match.title || `Match #${match.matchNumber}`}</h3>
              <p className="text-sm text-gray-600">
                {new Date(match.date).toLocaleDateString()} - {match.status}
              </p>
              <div className="mt-2">
                <strong>Teams:</strong> {match.teams.length}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => navigate(`/organizer/tournaments/${id}/matches/${match._id}`)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                >
                  View Details
                </button>
                {match.status !== 'completed' && (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                    onClick={() => navigate(`/organizer/tournaments/${id}/matches/${match._id}/update`)}
                  >
                    Update Result
                  </button>
                )}
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="col-span-2 text-center py-4">
              No matches created yet
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => navigate(`/organizer/tournaments/${id}/matches/create`)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Match
          </button>
        </div>
      </div>
      
      {/* Register Team Modal */}
      {showRegisterTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-90vh overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Register New Team</h2>
            
            <form onSubmit={handleRegisterTeamSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={teamForm.name}
                  onChange={handleTeamFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Captain Name *
                </label>
                <input
                  type="text"
                  name="captainName"
                  value={teamForm.captainName}
                  onChange={handleTeamFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={teamForm.mobileNumber}
                  onChange={handleTeamFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Team Members
                </label>
                {teamForm.members.map((member, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder={`Member ${index + 1} Name`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-bold">Entry Fee: ₹{tournament.entryFee}</p>
                <p className="text-xs text-gray-600 mt-1">Payment will be processed via PhonePe</p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRegisterTeamModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={teamForm.paymentProcessing}
                >
                  {teamForm.paymentProcessing ? 'Processing...' : 'Register & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;