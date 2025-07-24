import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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
  const [itemsPerPage] = useState(10);
  
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
      
      const response = await axios.get(`${API_URL}/tournaments`, {
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
      const response = await axios.delete(`${API_URL}/tournaments/${tournamentId}`, {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Organizer:</label>
          <select
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {tournaments.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <p className="text-gray-600">No tournaments found.</p>
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
                            className="h-10 w-10 rounded-md mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                            T{tournament.tournamentNumber || '#'}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tournament.title}</div>
                          <div className="text-sm text-gray-500">#{tournament.tournamentNumber} • By {tournament.organizerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament.game} ({tournament.platform})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tournament.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tournament.registeredTeams?.length || 0} / {tournament.maxTeams}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tournament.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                        ${tournament.status === 'open' ? 'bg-green-100 text-green-800' : ''}
                        ${tournament.status === 'full' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : ''}
                        ${tournament.status === 'completed' ? 'bg-purple-100 text-purple-800' : ''}
                        ${tournament.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/admin/tournaments/${tournament._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/tournaments/${tournament._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteTournament(tournament._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === number + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllTournaments;