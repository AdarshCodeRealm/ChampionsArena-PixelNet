import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiDollarSign, FiUsers, FiInfo, FiEdit2, FiTrash2, 
         FiAward, FiBook, FiGlobe, FiMap, FiClock } from 'react-icons/fi';
import { IoMdTrophy, IoLogoGameControllerB } from 'react-icons/io';
import { GiPodium, GiTrophy, GiSwordman, GiConsoleController } from 'react-icons/gi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

const TournamentDetailModal = ({ isOpen, onClose, tournamentId, user, onDeleted }) => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    if (isOpen && tournamentId) {
      fetchTournamentDetails();
    }
  }, [tournamentId, isOpen]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/tournaments/${tournamentId}?populate=organizer`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        setTournament(response.data.data);
      } else {
        toast.error('Failed to fetch tournament details');
      }
    } catch (err) {
      console.error('Error fetching tournament details:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    try {
      const endpoint = user.role === 'admin' || user.role === 'super-admin' 
        ? `${API_URL}/tournaments/admin/${tournamentId}`
        : `${API_URL}/tournaments/${tournamentId}`;
        
      const response = await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        onClose();
        if (onDeleted) onDeleted();
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
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  const getStatusStyles = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800';
      case 'open': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'full': return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      case 'ongoing': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'completed': return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  const getMatchStatusStyles = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'ongoing': return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      case 'completed': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  const getPaymentStyles = (status) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      case 'failed': return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="relative">
          {/* Header area with gradient background */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {loading ? 'Loading...' : tournament ? tournament.title : 'Tournament Details'}
              </h3>
              <div className="flex items-center space-x-2">
                {!loading && tournament && tournament.status !== 'completed' && (
                  <>
                    <button 
                      onClick={() => navigate(`/admin/tournaments/${tournamentId}/edit`)}
                      className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      title="Edit Tournament"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                      title="Delete Tournament"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            
            {/* Game and platform info */}
            {!loading && tournament && (
              <div className="mt-3 flex items-center text-gray-200 opacity-90">
                <GiConsoleController className="mr-2" />
                <span>{tournament.game}</span>
                <span className="mx-2">•</span>
                <FiGlobe className="mr-2" />
                <span>{tournament.platform}</span>
                
                {/* Status badge */}
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getStatusStyles(tournament.status)}`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Banner Image - Larger with overlay */}
          {!loading && tournament && tournament.bannerImage && (
            <div className="relative h-40 overflow-hidden">
              <img 
                src={tournament.bannerImage} 
                alt={tournament.title}
                className="absolute inset-0 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tournament details...</p>
          </div>
        ) : tournament ? (
          <>
            {/* Tabs Navigation - Modern Style */}
            <div className="border-b border-gray-200 px-6 bg-gray-50">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  <FiInfo className="mr-2" />
                  Details
                </button>
                <button
                  className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'teams'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('teams')}
                >
                  <FiUsers className="mr-2" />
                  Teams
                  {tournament.registeredTeams?.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {tournament.registeredTeams.length}
                    </span>
                  )}
                </button>
                {tournament.matches?.length > 0 && (
                  <button
                    className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'matches'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('matches')}
                  >
                    <GiSwordman className="mr-2" />
                    Matches
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {tournament.matches.length}
                    </span>
                  </button>
                )}
                {tournament.winners?.length > 0 && (
                  <button
                    className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'winners'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('winners')}
                  >
                    <IoMdTrophy className="mr-2" />
                    Winners
                  </button>
                )}
              </nav>
            </div>
            
            {/* Tab Content - Scrollable Area with Improved Styling */}
            <div className="overflow-y-auto p-6 bg-white" style={{ maxHeight: 'calc(90vh - 280px)' }}>
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    {/* Removing the left organizer profile section as it's redundant with the one in the sidebar */}
                    
                    {/* Description section - existing */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <FiInfo className="mr-2 text-blue-600" />
                        Description
                      </h3>
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <p className="text-gray-700 whitespace-pre-line">{tournament.description}</p>
                      </div>
                    </div>
                    
                    {/* Rules section - existing */}
                    {tournament.rules && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                          <FiBook className="mr-2 text-blue-600" />
                          Rules
                        </h3>
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                          <p className="text-gray-700 whitespace-pre-line">{tournament.rules}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                      <FiInfo className="mr-2 text-indigo-600" />
                      Tournament Info
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Organizer info with profile picture - making label smaller and more subtle */}
                      <div className="flex items-start mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mr-3 flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
                          {tournament.organizer?.profilePicture ? (
                            <img 
                              src={tournament.organizer.profilePicture} 
                              alt={tournament.organizerName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tournament.organizerName)}&background=6366F1&color=ffffff&size=128`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tournament.organizerName)}&background=6366F1&color=ffffff&size=128`}
                              alt={tournament.organizerName} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-xs font-medium text-indigo-400">Organizer</p>
                          <p className="text-base font-semibold text-gray-900">{tournament.organizerName}</p>
                          {tournament.organizer?.email && (
                            <p className="text-sm text-gray-600 mt-0.5 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {tournament.organizer.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date and Time section */}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <FiCalendar size={20} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-indigo-600">Start Date & Time</p>
                          <p className="text-base font-semibold text-gray-900">{formatDate(tournament.startDate)}</p>
                          <p className="text-base font-medium text-gray-700 mt-1">
                            <FiClock className="inline mr-1" /> {formatTime(tournament.startDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FiUsers size={20} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Team Registration</p>
                          <p className="text-base font-semibold text-gray-900">
                            {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} teams
                          </p>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, ((tournament.registeredTeams?.length || 0) / tournament.maxTeams) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Team Size: <span className="font-medium">{tournament.teamSize === 'other' ? tournament.customTeamSize : tournament.teamSize}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <FiDollarSign size={20} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Financial</p>
                          <p className="text-base text-gray-900">
                            Entry Fee: <span className="font-semibold">{tournament.entryFee ? `₹${tournament.entryFee}` : 'Free'}</span>
                          </p>
                          <p className="text-base text-gray-900">
                            Prize Pool: <span className="font-semibold">{tournament.prizePool ? `₹${tournament.prizePool}` : 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Remove duplicate organizer info since we've added detailed version above */}
                      {!tournament.organizer && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <FiInfo size={20} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Organizer</p>
                            <p className="text-base font-semibold text-gray-900">{tournament.organizerName}</p>
                            {tournament.upiAddress && (
                              <p className="text-sm text-gray-600 mt-1">UPI: <span className="font-medium">{tournament.upiAddress}</span></p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Always show UPI info if available */}
                      {tournament.upiAddress && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <FiDollarSign size={20} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Payment Information</p>
                            <p className="text-base font-medium text-gray-900">
                              UPI: <span className="font-semibold">{tournament.upiAddress}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'teams' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FiUsers className="mr-2 text-blue-600" />
                    Registered Teams
                  </h3>
                  {tournament.registeredTeams && tournament.registeredTeams.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tournament.registeredTeams.map((team) => (
                            <tr key={team._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-700">
                                  {team.captainInfo?.name || 'Unknown'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-700">
                                  {new Date(team.registrationDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getPaymentStyles(team.paymentStatus)}`}>
                                  {team.paymentStatus.charAt(0).toUpperCase() + team.paymentStatus.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 text-center rounded-xl border border-gray-200 flex flex-col items-center">
                      <FiUsers size={40} className="text-gray-400 mb-2" />
                      <p className="text-gray-500 text-lg">No teams have registered for this tournament yet.</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'matches' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <GiSwordman className="mr-2 text-blue-600" />
                    Match Records
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.matches.map((match) => (
                      <div key={match._id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg text-gray-800">Match #{match.matchNumber}</h4>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getMatchStatusStyles(match.status)}`}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </span>
                        </div>
                        
                        {match.description && (
                          <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{match.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {match.date && (
                            <div className="flex items-center text-gray-700">
                              <FiCalendar className="mr-2 text-indigo-500" />
                              <span>{new Date(match.date).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {match.time && (
                            <div className="flex items-center text-gray-700">
                              <FiClock className="mr-2 text-indigo-500" />
                              <span>{match.time}</span>
                            </div>
                          )}
                          
                          {match.location && (
                            <div className="flex items-center text-gray-700">
                              <FiMap className="mr-2 text-indigo-500" />
                              <span>{match.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'winners' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <IoMdTrophy className="mr-2 text-yellow-500" />
                    Tournament Winners
                  </h3>
                  
                  {/* Winners Podium for top 3 */}
                  {tournament.winners && tournament.winners.length > 0 && (
                    <div className="flex justify-center items-end mb-12 space-x-4">
                      {tournament.winners.sort((a, b) => a.position - b.position).slice(0, 3).map((winner) => {
                        // Determine which position this is
                        const position = winner.position;
                        let height, backgroundColor, textColor, icon;
                        
                        if (position === 1) {
                          height = 'h-32';
                          backgroundColor = 'bg-gradient-to-b from-yellow-400 to-yellow-600';
                          textColor = 'text-white';
                          icon = <GiTrophy size={32} className="text-yellow-300" />;
                        } else if (position === 2) {
                          height = 'h-24'; 
                          backgroundColor = 'bg-gradient-to-b from-gray-300 to-gray-500';
                          textColor = 'text-white';
                          icon = <IoMdTrophy size={28} className="text-gray-200" />;
                        } else {
                          height = 'h-20';
                          backgroundColor = 'bg-gradient-to-b from-amber-700 to-amber-900';
                          textColor = 'text-white';
                          icon = <FiAward size={24} className="text-amber-300" />;
                        }
                        
                        return (
                          <div key={winner._id} className="flex flex-col items-center">
                            <div className="mb-2 text-center">
                              <div className="font-bold text-gray-900">{winner.team?.name || 'Unknown Team'}</div>
                              <div className="text-green-600 font-semibold">₹{winner.prize}</div>
                            </div>
                            <div className={`${backgroundColor} ${height} w-24 rounded-t-lg flex flex-col items-center justify-center ${textColor}`}>
                              {icon}
                              <span className="font-bold mt-1">#{winner.position}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Regular table for all winners */}
                  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
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
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {winner.position === 1 ? (
                                  <GiTrophy className="mr-2 text-yellow-500" size={20} />
                                ) : winner.position === 2 ? (
                                  <GiTrophy className="mr-2 text-gray-400" size={20} />
                                ) : winner.position === 3 ? (
                                  <GiTrophy className="mr-2 text-amber-700" size={20} />
                                ) : (
                                  <span className="w-6 h-6 mr-2 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">{winner.position}</span>
                                )}
                                <div className="text-sm font-medium text-gray-900">#{winner.position}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {winner.team?.name || 'Unknown Team'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-green-600">
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
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Tournament not found</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteTournament}
          tournamentTitle={tournament?.title}
        />
      </div>
    </div>
  );
};

export default TournamentDetailModal;