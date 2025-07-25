import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEdit2, FiTrash2, FiUsers, FiCalendar, FiDollarSign, FiInfo, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import TournamentDetailModal from '../../components/TournamentDetailModal';

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

const AllTournaments = () => {
  // Initialize tournaments as an empty array to ensure it's always an array
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // For filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizerFilter, setOrganizerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // For the tournament detail modal
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  
  // View mode toggle (cards or table)
  const [viewMode, setViewMode] = useState('table'); // Default to table view
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    console.log("Current user:", user); // Debug log to see user data
    
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
    
    fetchAllTournaments();
    fetchOrganizers();
  }, [user, navigate]);

  const fetchOrganizers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/organizers/approved`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        setOrganizers(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (err) {
      console.error('Error fetching organizers:', err);
    }
  };

  const fetchAllTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the populate parameter to include organizer data with profile pictures
      const response = await axios.get(`${API_URL}/tournaments?populate=organizer`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      console.log("API Response:", response.data); // Debug log to see API response
      
      if (response.data.success) {
        // Extract the tournaments array from the nested response structure
        // The structure is: { data: { data: [...tournaments], total, page, limit, pages }, success, message }
        const tournamentsData = response.data.data && Array.isArray(response.data.data.data) 
          ? response.data.data.data 
          : [];
          
        console.log("Tournaments data:", tournamentsData); // Debug log to see tournaments data
        console.log(tournamentsData.length, " tournaments fetched"); // Debug log for count of tournaments
        setTournaments(tournamentsData);
      } else {
        setError('Failed to fetch tournaments');
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.response?.data?.message || 'Failed to fetch tournaments');
      toast.error(err.response?.data?.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_URL}/tournaments/admin/${tournamentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        fetchAllTournaments(); // Refresh the list
      } else {
        toast.error('Failed to delete tournament');
      }
    } catch (err) {
      console.error('Error deleting tournament:', err);
      toast.error(err.response?.data?.message || 'Failed to delete tournament');
    }
  };

  const openTournamentModal = (tournamentId) => {
    setSelectedTournamentId(tournamentId);
    setIsModalOpen(true);
  };

  const closeTournamentModal = () => {
    setIsModalOpen(false);
    setSelectedTournamentId(null);
  };

  const openDeleteConfirmationModal = (tournamentId, tournamentTitle) => {
    setTournamentToDelete({ id: tournamentId, title: tournamentTitle });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(false);
    setTournamentToDelete(null);
  };

  const confirmDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    
    try {
      const response = await axios.delete(`${API_URL}/tournaments/admin/${tournamentToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Tournament deleted successfully');
        fetchAllTournaments(); // Refresh the list
        closeDeleteConfirmationModal();
      } else {
        toast.error('Failed to delete tournament');
      }
    } catch (err) {
      console.error('Error deleting tournament:', err);
      toast.error(err.response?.data?.message || 'Failed to delete tournament');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter tournaments based on search, status, and organizer
  const filteredTournaments = Array.isArray(tournaments) ? tournaments.filter(tournament => {
    const matchesSearch = 
      tournament.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.game?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.organizerName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    const matchesOrganizer = organizerFilter === 'all' || 
                            tournament.organizer === organizerFilter ||
                            tournament.organizerName === organizerFilter;
    
    return matchesSearch && matchesStatus && matchesOrganizer;
  }) : [];
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTournaments = filteredTournaments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);

  // Page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-300 rounded-md">
        <p className="text-red-700">Error: {error}</p>
        <button 
          onClick={fetchAllTournaments}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Tournaments</h2>
        <Link 
          to="/admin/tournaments/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Tournament
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 transition-all"
            >
              <FiFilter className={isFilterExpanded ? "text-blue-600" : "text-gray-600"} />
              <span className="text-sm font-medium">Filters</span>
            </button>
            {/* Removed Cards/Table toggle buttons - always using Table view */}
          </div>
        </div>
        
        {isFilterExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
              <select
                value={organizerFilter}
                onChange={(e) => setOrganizerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Organizers</option>
                {organizers.map(organizer => (
                  <option key={organizer._id} value={organizer._id}>
                    {organizer.name || organizer.organizerName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filteredTournaments.length > 0 && (
          <p className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTournaments.length)} of {filteredTournaments.length} tournaments
          </p>
        )}
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-md text-center">
          <p className="text-gray-200 text-lg">No tournaments found.</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-600 text-lg">No tournaments match your filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize Pool</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTournaments.map((tournament) => (
                  <tr key={tournament._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tournament.bannerImage ? (
                          <img 
                            src={tournament.bannerImage} 
                            alt={tournament.title} 
                            className="h-12 w-12 rounded-lg mr-3 object-cover shadow-sm border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 mr-3 flex items-center justify-center text-white font-bold shadow-sm">
                            {tournament.title ? tournament.title.charAt(0).toUpperCase() : 'T'}
                          </div>
                        )}
                        <div className="ml-2">
                          <div className="text-sm font-semibold text-gray-900">{tournament.title}</div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            {tournament.tournamentNumber && (
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-xs font-medium mr-2">
                                #{tournament.tournamentNumber}
                              </span>
                            )}
                            {tournament.organizerName && (
                              <div className="flex items-center">
                                <span className="inline-block w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-1.5 flex-shrink-0 overflow-hidden shadow-sm border border-gray-300">
                                  {tournament.organizer?.profilePicture ? (
                                    <img 
                                      src={tournament.organizer.profilePicture} 
                                      alt={tournament.organizerName} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tournament.organizerName)}&background=6366F1&color=ffffff&size=28`;
                                      }}
                                    />
                                  ) : (
                                    <img 
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tournament.organizerName)}&background=6366F1&color=ffffff&size=28`}
                                      alt={tournament.organizerName} 
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </span>
                                <span className="font-medium text-gray-700">{tournament.organizerName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tournament.game}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{formatDate(tournament.startDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament.registeredTeams?.length || 0} / {tournament.maxTeams}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament.entryFee ? `₹${tournament.entryFee}` : 'Free'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament.prizePool ? `₹${tournament.prizePool}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(tournament.status)}`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTournamentModal(tournament._id)}
                          className="flex items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <FiEye className="mr-1.5 h-4 w-4" /> View
                        </button>
                        {tournament.status !== 'completed' && (
                          <>
                            <Link
                              to={`/admin/tournaments/${tournament._id}/edit`}
                              className="flex items-center justify-center px-3 py-2 text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                            >
                              <FiEdit2 className="mr-1.5 h-4 w-4" /> Edit
                            </Link>
                            <button
                              onClick={() => openDeleteConfirmationModal(tournament._id, tournament.title)}
                              className="flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <FiTrash2 className="mr-1.5 h-4 w-4" /> Delete
                            </button>
                          </>
                        )}
                        {tournament.status === 'completed' && (
                          <span className="text-xs text-gray-500 italic ml-2 flex items-center">
                            Completed tournaments cannot be modified
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tournament Detail Modal */}
      {isModalOpen && (
        <TournamentDetailModal 
          isOpen={isModalOpen}
          tournamentId={selectedTournamentId} 
          onClose={closeTournamentModal}
          user={user}
          onDeleted={fetchAllTournaments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && tournamentToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteConfirmationModal}
          onConfirm={confirmDeleteTournament}
          tournamentTitle={tournamentToDelete.title}
        />
      )}

      {/* Pagination Controls - Only show on table view */}
      {viewMode === 'table' && (
        <div className="mt-4">
          <nav className="flex justify-between items-center">
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden md:flex md:gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AllTournaments;