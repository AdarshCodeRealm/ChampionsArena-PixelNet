import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 25,
    activePlayers: 18,
    pendingOrganizers: 3,
    approvedOrganizers: 8,
    totalTournaments: 12,
    activeTournaments: 5,
    completedTournaments: 7,
    recentRegistrations: []
  });

  // Sample data for players and tournaments to show even if API fails
  const samplePlayers = [
    {
      _id: "p1",
      name: "Raj Kumar",
      email: "raj.kumar@example.com",
      createdAt: new Date("2025-06-15").toISOString(),
      isVerified: true,
      isBanned: false
    },
    {
      _id: "p2",
      name: "Priya Singh",
      email: "priya.singh@example.com",
      createdAt: new Date("2025-06-18").toISOString(),
      isVerified: true,
      isBanned: false
    },
    {
      _id: "p3",
      name: "Aman Verma",
      email: "aman.verma@example.com",
      createdAt: new Date("2025-06-20").toISOString(),
      isVerified: false,
      isBanned: false
    },
    {
      _id: "p4",
      name: "Neha Sharma",
      email: "neha.sharma@example.com",
      createdAt: new Date("2025-06-22").toISOString(),
      isVerified: true,
      isBanned: true
    }
  ];

  // Sample player registrations in tournaments
  const sampleRegistrations = [
    {
      _id: "r1",
      playerName: "Ajay Singh",
      tournamentName: "BGMI Summer Championship",
      registeredAt: new Date("2025-07-22").toISOString()
    },
    {
      _id: "r2",
      playerName: "Sneha Gupta",
      tournamentName: "Call of Duty Mobile League",
      registeredAt: new Date("2025-07-23").toISOString()
    },
    {
      _id: "r3",
      playerName: "Rohit Patel",
      tournamentName: "Free Fire Pro Series",
      registeredAt: new Date("2025-07-24").toISOString()
    }
  ];

  const sampleTournaments = [
    {
      _id: "t1",
      title: "BGMI Summer Championship",
      game: "Battlegrounds Mobile India",
      startDate: new Date("2025-07-28").toISOString(),
      status: "open"
    },
    {
      _id: "t2",
      title: "Call of Duty Mobile League",
      game: "Call of Duty Mobile",
      startDate: new Date("2025-08-05").toISOString(),
      status: "open"
    },
    {
      _id: "t3",
      title: "Free Fire Pro Series",
      game: "Garena Free Fire",
      startDate: new Date("2025-07-15").toISOString(),
      status: "ongoing"
    },
    {
      _id: "t4",
      title: "FIFA 25 Cup",
      game: "FIFA 25",
      startDate: new Date("2025-08-12").toISOString(),
      status: "open"
    }
  ];
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");
        
        // Fetch dashboard statistics
        try {
          console.log("Fetching stats from:", `${API_URL}/admin/dashboard/stats`);
          const statsResponse = await axios.get(
            `${API_URL}/admin/dashboard/stats`, 
            getAuthHeaders()
          );
          console.log("Stats response:", statsResponse);
          
          if (statsResponse.data && statsResponse.data.data) {
            // Set stats with existing data
            const apiStats = statsResponse.data.data;
            setStats(prevStats => ({
              ...prevStats,
              ...apiStats,
              // Add completed tournaments if not provided by API
              completedTournaments: apiStats.completedTournaments || apiStats.totalTournaments - apiStats.activeTournaments || 7,
              // Default to sample registrations if not provided
              recentRegistrations: apiStats.recentRegistrations || sampleRegistrations
            }));
          } else {
            console.warn("Stats response didn't have expected structure:", statsResponse.data);
            // Keep using the default sample data defined in state
            setStats(prevStats => ({
              ...prevStats,
              recentRegistrations: sampleRegistrations
            }));
          }
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          console.error('Response:', error.response?.data);
          // Keep using the default sample data defined in state
          setStats(prevStats => ({
            ...prevStats,
            recentRegistrations: sampleRegistrations
          }));
        }
        
        // Fetch recent players (limited to 5)
        try {
          console.log("Fetching players from:", `${API_URL}/admin/players?limit=5`);
          const playersResponse = await axios.get(
            `${API_URL}/admin/players?limit=5`,
            getAuthHeaders()
          );
          console.log("Players response:", playersResponse);
          
          if (playersResponse.data && playersResponse.data.data) {
            setRecentPlayers(playersResponse.data.data || []);
          } else {
            console.warn("Players response didn't have expected structure:", playersResponse.data);
            setRecentPlayers(samplePlayers);
          }
        } catch (error) {
          console.error('Error fetching players:', error);
          console.error('Response:', error.response?.data);
          setRecentPlayers(samplePlayers);
        }
        
        // Fetch recent tournaments (limited to 5)
        try {
          console.log("Fetching tournaments from:", `${API_URL}/admin/tournaments?limit=5`);
          const tournamentsResponse = await axios.get(
            `${API_URL}/admin/tournaments?limit=5`,
            getAuthHeaders()
          );
          console.log("Tournaments response:", tournamentsResponse);
          
          if (tournamentsResponse.data && tournamentsResponse.data.data && tournamentsResponse.data.data.data) {
            setRecentTournaments(tournamentsResponse.data.data.data || []);
          } else {
            console.warn("Tournaments response didn't have expected structure:", tournamentsResponse.data);
            setRecentTournaments(sampleTournaments);
          }
        } catch (error) {
          console.error('Error fetching tournaments:', error);
          console.error('Response:', error.response?.data);
          setRecentTournaments(sampleTournaments);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setRecentPlayers(samplePlayers);
        setRecentTournaments(sampleTournaments);
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

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
        <p className="mt-2 text-blue-100">Manage all aspects of your tournament platform from here.</p>
      </div>
      
      {/* First row of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pending Organizers Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-yellow-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm">Pending Organizers</h3>
          <p className="text-3xl font-bold">{stats.pendingOrganizers}</p>
          <a href="/admin/organizers/pending" className="text-xs text-blue-600 mt-2">View all pending requests →</a>
        </div>
        
        {/* Approved Organizers Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-green-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm">Approved Organizers</h3>
          <p className="text-3xl font-bold">{stats.approvedOrganizers}</p>
          <a href="/admin/organizers/approved" className="text-xs text-blue-600 mt-2">View all organizers →</a>
        </div>
        
        {/* Enhanced Total Tournaments Card (matching existing style) */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="bg-blue-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm mt-2">Total Tournaments</h3>
          <p className="text-3xl font-bold">{stats.totalTournaments}</p>
          
          <div className="w-full mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.activeTournaments / stats.totalTournaments * 100}%` }}></div>
            </div>
            <div className="flex justify-between w-full mt-2 text-sm">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
                Active: {stats.activeTournaments}
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-1"></span>
                Completed: {stats.completedTournaments}
              </span>
            </div>
          </div>
          
          <a href="/admin/tournaments" className="text-xs text-blue-600 mt-2">View all tournaments →</a>
        </div>
        
        {/* Player Registrations Card (replacing Active Tournaments) */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="bg-purple-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm mt-2">Players</h3>
          <p className="text-3xl font-bold">{stats.totalPlayers}</p>
          
          <div className="w-full mt-2">
            <div className="text-xs text-gray-500 mb-1">Recent Registrations:</div>
            {stats.recentRegistrations && stats.recentRegistrations.slice(0, 2).map((reg, idx) => (
              <div key={reg._id || idx} className="text-xs flex justify-between">
                <span className="font-medium truncate max-w-[80px]">{reg.playerName}</span>
                <span className="text-gray-500">{formatShortDate(reg.registeredAt)}</span>
              </div>
            ))}
          </div>
          
          <a href="/admin/players" className="text-xs text-blue-600 mt-2">View all players →</a>
        </div>
      </div>

      {/* Stats Cards - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Total Players Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-blue-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm">Total Players</h3>
          <p className="text-3xl font-bold">{stats.totalPlayers}</p>
          
          <div className="w-full mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.activePlayers / stats.totalPlayers * 100}%` }}></div>
            </div>
            <div className="flex justify-between w-full mt-2 text-sm">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
                Active: {stats.activePlayers}
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-1"></span>
                Inactive: {stats.totalPlayers - stats.activePlayers}
              </span>
            </div>
          </div>
          
          <a href="/admin/players" className="text-xs text-blue-600 mt-2">View all players →</a>
        </div>

        {/* Active Players Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-indigo-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm">Active Players</h3>
          <p className="text-3xl font-bold">{stats.activePlayers}</p>
          <a href="/admin/players?filter=active" className="text-xs text-blue-600 mt-2">View active players →</a>
        </div>
      </div>
      
      {/* Quick Access Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No players have registered yet</p>
              <button 
                onClick={() => navigate('/admin/players')}
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded"
              >
                Add Players
              </button>
            </div>
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
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-green-100 rounded-full text-green-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No tournaments have been created yet</p>
              <button 
                onClick={() => navigate('/admin/tournaments')}
                className="text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded"
              >
                Add Tournament
              </button>
            </div>
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