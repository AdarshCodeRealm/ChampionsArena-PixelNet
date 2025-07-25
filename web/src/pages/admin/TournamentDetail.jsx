import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiUsers, FiInfo, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

// Custom Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, tournamentTitle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-red-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Delete Tournament</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-red-700 transition-colors">
              <FiX size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4 text-red-600">
            <FiTrash2 size={24} className="mr-2" />
            <p className="text-lg font-semibold">Confirm Deletion</p>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-bold">{tournamentTitle}</span>? This action cannot be undone and all related data will be permanently removed.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Tournament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    // Verify admin or super-admin authentication before proceeding
    if (!user || !user.token) {
      toast.error('You need to be logged in to view this page');
      navigate('/login');
      return;
    }
    
    // Check if the user is either admin or super-admin
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      toast.error('You are not authorized to view this page');
      navigate('/login');
      return;
    }
    
    fetchTournamentDetails();
  }, [tournamentId, user, navigate]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/tournaments/${tournamentId}?populate=organizer`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        setTournament(response.data.data);
        console.log("Tournament details:", response.data.data);
      } else {
        setError('Failed to fetch tournament details');
      }
    } catch (err) {
      console.error('Error fetching tournament details:', err);
      setError(err.response?.data?.message || 'Failed to fetch tournament details');
      toast.error(err.response?.data?.message || 'Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    try {
      const response = await axios.delete(`${API_URL}/tournaments/admin/${tournamentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        navigate('/admin/tournaments');
      } else {
        toast.error('Failed to delete tournament');
      }
    } catch (err) {
      console.error('Error deleting tournament:', err);
      toast.error(err.response?.data?.message || 'Failed to delete tournament');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="p-6 bg-red-100 border border-red-300 rounded-md">
        <p className="text-red-700">Error: {error || 'Tournament not found'}</p>
        <button 
          onClick={fetchTournamentDetails}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
        <Link 
          to="/admin/tournaments"
          className="mt-3 ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Tournaments
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with navigation and actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link 
            to="/admin/tournaments"
            className="mr-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
          >
            <FiArrowLeft className="text-gray-700" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Tournament Details</h2>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/admin/tournaments/${tournamentId}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FiEdit2 className="mr-2" /> Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Tournament Banner */}
      <div className="relative w-full h-48 md:h-64 bg-gray-100 rounded-lg overflow-hidden mb-6">
        {tournament.bannerImage ? (
          <img 
            src={tournament.bannerImage} 
            alt={tournament.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <h3 className="text-white text-2xl md:text-3xl font-bold">{tournament.title}</h3>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-sm font-bold rounded-full 
            ${tournament.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
            ${tournament.status === 'open' ? 'bg-green-500 text-white' : ''}
            ${tournament.status === 'full' ? 'bg-yellow-500 text-white' : ''}
            ${tournament.status === 'ongoing' ? 'bg-blue-500 text-white' : ''}
            ${tournament.status === 'completed' ? 'bg-purple-500 text-white' : ''}
            ${tournament.status === 'cancelled' ? 'bg-red-500 text-white' : ''}
          `}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Tournament Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{tournament.title}</h1>
          <div className="flex items-center mb-4">
            <span className="text-sm bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-md">#{tournament.tournamentNumber}</span>
            <span className="ml-4 text-sm bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-md">
              {tournament.game}
            </span>
            <span className="ml-4 text-sm bg-gray-100 text-gray-800 font-medium px-2 py-1 rounded-md">
              {tournament.platform}
            </span>
            <span className="ml-4 text-sm bg-purple-100 text-purple-800 font-medium px-2 py-1 rounded-md">
              Region: {tournament.region}
            </span>
          </div>

          <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{tournament.description}</p>

          {tournament.rules && (
            <>
              <h3 className="font-semibold text-gray-800 mb-2">Rules</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 whitespace-pre-line">{tournament.rules}</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Tournament Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FiCalendar className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Start Date & Time</p>
                <p className="font-medium">{formatDate(tournament.startDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiUsers className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Team Registration</p>
                <p className="font-medium">
                  {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} teams
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Team Size: {tournament.teamSize === 'other' ? tournament.customTeamSize : tournament.teamSize}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiDollarSign className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Financial Details</p>
                <p className="font-medium">
                  Entry Fee: {tournament.entryFee ? `₹${tournament.entryFee}` : 'Free'}
                </p>
                <p className="font-medium">
                  Prize Pool: {tournament.prizePool ? `₹${tournament.prizePool}` : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiInfo className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="font-medium">{tournament.organizerName}</p>
                {tournament.upiAddress && (
                  <p className="text-sm text-gray-500 mt-1">UPI: {tournament.upiAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Teams Section */}
      <div className="mt-8">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">Registered Teams</h3>
        {tournament.registeredTeams && tournament.registeredTeams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournament.registeredTeams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {team.captainInfo?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(team.registrationDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${team.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${team.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${team.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {team.paymentStatus.charAt(0).toUpperCase() + team.paymentStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-gray-500">No teams have registered for this tournament yet.</p>
          </div>
        )}
      </div>

      {/* Matches Section */}
      {tournament.matches && tournament.matches.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">Match Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournament.matches.map((match) => (
              <div key={match._id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Match #{match.matchNumber}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                    ${match.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${match.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${match.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </span>
                </div>
                {match.description && <p className="text-sm text-gray-600 mb-2">{match.description}</p>}
                {match.date && (
                  <p className="text-sm text-gray-500">
                    <FiCalendar className="inline mr-1" /> {new Date(match.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Winners Section */}
      {tournament.winners && tournament.winners.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">Tournament Winners</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournament.winners.sort((a, b) => a.position - b.position).map((winner) => (
                  <tr key={winner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{winner.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {winner.team?.name || 'Unknown Team'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{winner.prize}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteTournament} 
        tournamentTitle={tournament.title}
      />
    </div>
  );
};

export default TournamentDetail;