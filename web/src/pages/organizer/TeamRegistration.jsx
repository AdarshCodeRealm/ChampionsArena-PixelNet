import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiExternalLink, FiDownload } from 'react-icons/fi';
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Registration Management</h1>
        {registrationRequests.length > 0 && (
          <button
            onClick={generatePaymentReport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FiDownload /> Export Payment Report
          </button>
        )}
      </div>

      {/* Tournament Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-2">
          Select Tournament
        </label>
        <select
          id="tournament"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Tournament --</option>
          {tournaments.map((tournament) => (
            <option key={tournament._id} value={tournament._id}>
              {tournament.title} ({new Date(tournament.startDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <>
          {/* Filter and Search Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status Filter
              </label>
              <select
                id="paymentFilter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Registration Date (Newest)</option>
                <option value="date-asc">Registration Date (Oldest)</option>
                <option value="name-asc">Team Name (A-Z)</option>
                <option value="name-desc">Team Name (Z-A)</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Teams
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by team name, captain or payment ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Display Selected Tournament Info */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            {tournaments.find(t => t._id === selectedTournament) && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {tournaments.find(t => t._id === selectedTournament).title}
                  </h2>
                  <p className="text-gray-500">
                    Entry Fee: ₹{tournaments.find(t => t._id === selectedTournament).entryFee} | 
                    Teams: {registrationRequests.length} / {tournaments.find(t => t._id === selectedTournament).maxTeams}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-gray-600">
                    Total Collection: ₹{registrationRequests.filter(req => req.paymentStatus === 'completed').length * 
                    (tournaments.find(t => t._id === selectedTournament).entryFee || 0)}
                  </p>
                  <p className="text-gray-600">
                    Pending Collection: ₹{registrationRequests.filter(req => req.paymentStatus === 'pending').length * 
                    (tournaments.find(t => t._id === selectedTournament).entryFee || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Registration List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Captain
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{request.captain?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(request.registrationDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                              request.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{request.paymentId || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDetailsModal(request)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <FiExternalLink />
                            </button>
                            <div className="relative group">
                              <button
                                className="text-gray-600 hover:text-gray-900 group-hover:text-gray-900"
                                title="Update Payment Status"
                              >
                                •••
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                <button
                                  onClick={() => handleUpdatePaymentStatus(request._id, 'pending')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Mark as Pending
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(request._id, 'completed')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Mark as Completed
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(request._id, 'failed')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Mark as Failed
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(request._id, 'refunded')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
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
          ) : (
            <div className="bg-gray-50 text-center py-12 rounded-lg">
              <p className="text-gray-500">No team registration requests found for this tournament.</p>
            </div>
          )}
        </>
      )}

      {/* Team Details Modal */}
      {detailsModal.isOpen && detailsModal.team && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Team Details</h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Team Information</h4>
                <p><span className="font-semibold">Name:</span> {detailsModal.team.name}</p>
                <p><span className="font-semibold">Registration Date:</span> {new Date(detailsModal.team.registrationDate).toLocaleString()}</p>
                <p>
                  <span className="font-semibold">Payment Status:</span> 
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${detailsModal.team.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      detailsModal.team.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      detailsModal.team.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {detailsModal.team.paymentStatus.charAt(0).toUpperCase() + detailsModal.team.paymentStatus.slice(1)}
                  </span>
                </p>
                <p><span className="font-semibold">Payment ID:</span> {detailsModal.team.paymentId || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Captain Information</h4>
                <p><span className="font-semibold">Name:</span> {detailsModal.team.captain?.name || 'Unknown'}</p>
                <p><span className="font-semibold">Email:</span> {detailsModal.team.captain?.email || 'Unknown'}</p>
                <p><span className="font-semibold">Phone:</span> {detailsModal.team.captain?.phone || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Team Members</h4>
              {detailsModal.team.members && detailsModal.team.members.length > 0 ? (
                <div className="bg-gray-50 p-3 rounded">
                  <ul className="divide-y divide-gray-200">
                    {detailsModal.team.members.map((member, index) => (
                      <li key={index} className="py-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{member.player?.name || 'Unknown Player'}</p>
                            <p className="text-sm text-gray-500">{member.player?.email || 'No email'}</p>
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${member.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No team members added</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Update Payment Status</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      handleUpdatePaymentStatus(detailsModal.team._id, 'completed');
                      closeDetailsModal();
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Mark Completed
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdatePaymentStatus(detailsModal.team._id, 'pending');
                      closeDetailsModal();
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    Mark Pending
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdatePaymentStatus(detailsModal.team._id, 'refunded');
                      closeDetailsModal();
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Mark Refunded
                  </button>
                </div>
              </div>
              
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRegistration;