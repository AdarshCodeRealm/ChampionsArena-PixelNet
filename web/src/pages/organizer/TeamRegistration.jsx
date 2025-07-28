import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiExternalLink, FiDownload, FiFilter, FiList, FiSearch, FiClock, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TeamRegistration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    team: null
  });
  const [isLandscapeMode, setIsLandscapeMode] = useState(window.innerWidth > window.innerHeight);
  const [displayMode, setDisplayMode] = useState('table'); // 'table' or 'card'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Detect screen orientation
  useEffect(() => {
    const handleResize = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscapeMode(landscape);
      
      // Switch to card view on small screens
      if (window.innerWidth < 768) {
        setDisplayMode('card');
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [user]);

  useEffect(() => {
    if (selectedTournament) {
      fetchRegistrationRequests();
    }
  }, [selectedTournament, paymentFilter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tournaments/organizer/tournaments`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setTournaments(response.data.data || []);
      // Set the first tournament as default selected if available
      if (response.data.data && response.data.data.length > 0) {
        setSelectedTournament(response.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error(error.response?.data?.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/tournaments/${selectedTournament}/teams?paymentStatus=${paymentFilter !== 'all' ? paymentFilter : ''}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setRegistrationRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching registration requests:", error);
      toast.error(error.response?.data?.message || 'Failed to fetch registration requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (teamId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/tournaments/${selectedTournament}/teams/${teamId}/payment-status`,
        { paymentStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast.success(`Payment status updated to ${newStatus}`);
      fetchRegistrationRequests();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const filteredRequests = registrationRequests
    .filter(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.captain?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.paymentId?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.registrationDate) - new Date(b.registrationDate);
        case 'date-desc':
          return new Date(b.registrationDate) - new Date(a.registrationDate);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
    });

  const openDetailsModal = (team) => {
    setDetailsModal({
      isOpen: true,
      team
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      team: null
    });
  };

  const generatePaymentReport = () => {
    // Implementation for generating payment reports
    const selectedTournamentData = tournaments.find(t => t._id === selectedTournament);
    if (!selectedTournamentData) return;
    
    const reportData = filteredRequests.map(team => ({
      teamName: team.name,
      captain: team.captain?.name || 'Unknown',
      paymentStatus: team.paymentStatus,
      paymentId: team.paymentId || 'N/A',
      registrationDate: new Date(team.registrationDate).toLocaleString(),
      amount: selectedTournamentData.entryFee
    }));
    
    // Create CSV content
    const csvHeader = 'Team Name,Captain,Payment Status,Payment ID,Registration Date,Amount\n';
    const csvContent = reportData.reduce((acc, row) => {
      return acc + `"${row.teamName}","${row.captain}","${row.paymentStatus}","${row.paymentId}","${row.registrationDate}","${row.amount}"\n`;
    }, csvHeader);
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedTournamentData.title}_payments_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Payment report downloaded successfully');
  };

  // Helper function to get payment status style
  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Card view for teams
  const TeamCard = ({ team }) => (
    <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900">{team.name}</h3>
          <p className="text-sm text-gray-600">Captain: {team.captain?.name || 'Unknown'}</p>
        </div>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusStyle(team.paymentStatus)}`}>
          {team.paymentStatus.charAt(0).toUpperCase() + team.paymentStatus.slice(1)}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
        <span>{new Date(team.registrationDate).toLocaleDateString()}</span>
        <span>{team.paymentId || 'No payment ID'}</span>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-500">
          {team.members?.length || 0} members
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => openDetailsModal(team)}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title="View Details"
          >
            <FiExternalLink size={14} />
          </button>
          <div className="relative group">
            <button
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded group-hover:bg-gray-100"
              title="Update Payment Status"
            >
              •••
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <button
                onClick={() => handleUpdatePaymentStatus(team._id, 'completed')}
                className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleUpdatePaymentStatus(team._id, 'pending')}
                className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              >
                Mark as Pending
              </button>
              <button
                onClick={() => handleUpdatePaymentStatus(team._id, 'failed')}
                className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                Mark as Failed
              </button>
              <button
                onClick={() => handleUpdatePaymentStatus(team._id, 'refunded')}
                className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              >
                Mark as Refunded
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 py-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Team Registration</h1>
        <div className="flex items-center gap-2">
          {registrationRequests.length > 0 && (
            <button
              onClick={generatePaymentReport}
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
            >
              <FiDownload size={14} /> Export Report
            </button>
          )}
          <button
            onClick={() => setDisplayMode(displayMode === 'table' ? 'card' : 'table')}
            className={`p-1.5 rounded ${displayMode === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            title={displayMode === 'table' ? 'Switch to Card View' : 'Switch to Table View'}
          >
            {displayMode === 'table' ? <FiList size={16} /> : <FiList size={16} />}
          </button>
        </div>
      </div>

      {/* Main layout - adapt to landscape/portrait */}
      <div className={isLandscapeMode ? "grid grid-cols-12 gap-4" : "space-y-4"}>
        {/* Left sidebar for filters in landscape mode */}
        <div className={isLandscapeMode ? "col-span-3" : ""}>
          <div className="bg-white rounded-lg shadow-sm p-3">
            {/* Tournament Selector */}
            <div className="mb-4">
              <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-1">
                Select Tournament
              </label>
              <select
                id="tournament"
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select Tournament --</option>
                {tournaments.map((tournament) => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters Section */}
            <div className="space-y-3">
              <div>
                <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiFilter size={14} className="mr-1.5" /> Payment Status
                </label>
                <select
                  id="paymentFilter"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiClock size={14} className="mr-1.5" /> Sort By
                </label>
                <select
                  id="sortOption"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Team Name (A-Z)</option>
                  <option value="name-desc">Team Name (Z-A)</option>
                </select>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiSearch size={14} className="mr-1.5" /> Search Teams
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Team, captain or payment ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Summary Stats */}
            {selectedTournament && tournaments.find(t => t._id === selectedTournament) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiDollarSign size={14} className="mr-1.5" /> Collection Summary
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="text-xs text-green-600">Collected</p>
                    <p className="font-bold text-green-700">
                      ₹{registrationRequests.filter(req => req.paymentStatus === 'completed').length * 
                      (tournaments.find(t => t._id === selectedTournament).entryFee || 0)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <p className="text-xs text-yellow-600">Pending</p>
                    <p className="font-bold text-yellow-700">
                      ₹{registrationRequests.filter(req => req.paymentStatus === 'pending').length * 
                      (tournaments.find(t => t._id === selectedTournament).entryFee || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-center p-1.5 bg-blue-50 rounded-md">
                  <div className="text-xs text-blue-600">Team Registration</div>
                  <div className="font-medium text-blue-800">
                    {registrationRequests.length} / {tournaments.find(t => t._id === selectedTournament).maxTeams}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className={isLandscapeMode ? "col-span-9" : ""}>
          {/* Team Registration List */}
          {loading ? (
            <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <>
              {/* Card View */}
              {displayMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRequests.map(request => (
                    <TeamCard key={request._id} team={request} />
                  ))}
                </div>
              )}
              
              {/* Table View */}
              {displayMode === 'table' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team Name
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Captain
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{request.captain?.name || 'Unknown'}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(request.registrationDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusStyle(request.paymentStatus)}`}>
                                {request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{request.paymentId?.substring(0, 8) || 'N/A'}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openDetailsModal(request)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <FiExternalLink size={16} />
                                </button>
                                <div className="relative group">
                                  <button
                                    className="text-gray-600 hover:text-gray-900 group-hover:text-gray-900"
                                    title="Update Payment Status"
                                  >
                                    •••
                                  </button>
                                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                    <button
                                      onClick={() => handleUpdatePaymentStatus(request._id, 'pending')}
                                      className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      Mark as Pending
                                    </button>
                                    <button
                                      onClick={() => handleUpdatePaymentStatus(request._id, 'completed')}
                                      className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      Mark as Completed
                                    </button>
                                    <button
                                      onClick={() => handleUpdatePaymentStatus(request._id, 'failed')}
                                      className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      Mark as Failed
                                    </button>
                                    <button
                                      onClick={() => handleUpdatePaymentStatus(request._id, 'refunded')}
                                      className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      Mark as Refunded
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 text-center py-12 rounded-lg">
              <FiUsers className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No team registration requests found.</p>
              <p className="text-sm text-gray-400 mt-1">
                {!selectedTournament ? 'Please select a tournament first.' : 'Try changing your filters to see more results.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Team Details Modal */}
      {detailsModal.isOpen && detailsModal.team && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiUsers className="mr-2 text-blue-600" /> Team Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Information</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{detailsModal.team.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registration Date:</span>
                      <span className="font-medium">{new Date(detailsModal.team.registrationDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusStyle(detailsModal.team.paymentStatus)}`}>
                        {detailsModal.team.paymentStatus.charAt(0).toUpperCase() + detailsModal.team.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">{detailsModal.team.paymentId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Captain Information</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{detailsModal.team.captain?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{detailsModal.team.captain?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{detailsModal.team.captain?.phone || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Members</h4>
                {detailsModal.team.members && detailsModal.team.members.length > 0 ? (
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="overflow-y-auto max-h-40">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {detailsModal.team.members.map((member, index) => (
                            <tr key={index} className="hover:bg-gray-100">
                              <td className="px-3 py-2 text-xs font-medium">{member.player?.name || 'Unknown'}</td>
                              <td className="px-3 py-2 text-xs text-gray-500">{member.player?.email || 'No email'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 text-xs rounded-full 
                                  ${member.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">No team members added</p>
                )}
              </div>
              
              <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Payment Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        handleUpdatePaymentStatus(detailsModal.team._id, 'completed');
                        closeDetailsModal();
                      }}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Completed
                    </button>
                    <button 
                      onClick={() => {
                        handleUpdatePaymentStatus(detailsModal.team._id, 'pending');
                        closeDetailsModal();
                      }}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => {
                        handleUpdatePaymentStatus(detailsModal.team._id, 'failed');
                        closeDetailsModal();
                      }}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Failed
                    </button>
                    <button 
                      onClick={() => {
                        handleUpdatePaymentStatus(detailsModal.team._id, 'refunded');
                        closeDetailsModal();
                      }}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Refunded
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={closeDetailsModal}
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 self-end"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRegistration;