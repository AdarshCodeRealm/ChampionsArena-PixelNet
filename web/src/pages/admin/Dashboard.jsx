import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent players (limited to 5)
        try {
          const playersResponse = await axios.get(`${API_URL}/admin/players?limit=5`);
          setRecentPlayers(playersResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching players:', error);
        }
        
        // Fetch recent tournaments (limited to 5)
        try {
          const tournamentsResponse = await axios.get(`${API_URL}/admin/tournaments?limit=5`);
          setRecentTournaments(tournamentsResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching tournaments:', error);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [API_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
        <p className="mt-2 text-blue-100">Manage all aspects of your tournament platform from here.</p>
      </div>
      
      {/* Quick Access Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/players')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 border-b-4 border-blue-500"
        >
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-800">Manage Players</span>
          <p className="text-sm text-gray-500">View, ban or unban players</p>
        </button>
        
        <button
          onClick={() => navigate('/admin/tournaments')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 border-b-4 border-green-500"
        >
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-800">View Tournaments</span>
          <p className="text-sm text-gray-500">Monitor and manage tournaments</p>
        </button>
        
        <button
          onClick={() => navigate('/admin/organizers/pending')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 border-b-4 border-amber-500"
        >
          <div className="p-3 bg-amber-100 rounded-full text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-800">Pending Requests</span>
          <p className="text-sm text-gray-500">Review organizer requests</p>
        </button>
        
        <button
          onClick={() => navigate('/admin/organizers/create')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 border-b-4 border-purple-500"
        >
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-800">Create Organizer</span>
          <p className="text-sm text-gray-500">Add a new organizer</p>
        </button>
      </div>
      
      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Players */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Players</h3>
            <button 
              onClick={() => navigate('/admin/players')}
              className="text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : recentPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No players found</p>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPlayers.map(player => (
                    <tr key={player._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {(player.name || player.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">{player.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{player.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(player.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          player.isBanned ? 'bg-red-100 text-red-800' : 
                          player.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {player.isBanned ? 'Banned' : player.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Recent Tournaments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Tournaments</h3>
            <button 
              onClick={() => navigate('/admin/tournaments')}
              className="text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : recentTournaments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tournaments found</p>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tournament</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTournaments.map(tournament => (
                    <tr key={tournament._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{tournament.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tournament.game}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(tournament.startDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tournament.status === 'open' ? 'bg-green-100 text-green-800' : 
                          tournament.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          tournament.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                          tournament.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;