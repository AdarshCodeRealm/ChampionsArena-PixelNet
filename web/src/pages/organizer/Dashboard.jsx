import { useEffect, useState } from 'react';
import axios from 'axios';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    ongoingTournaments: 0,
    completedTournaments: 0,
    totalPlayers: 0,
    activePlayers: 0,
    inactivePlayers: 0,
    recentPlayers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint for organizer stats
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        // Example endpoints (replace with real ones if available)
        // const tournamentsRes = await axios.get(`${API_URL}/organizer/tournaments`);
        // const matchesRes = await axios.get(`${API_URL}/organizer/matches`);
        // const playersRes = await axios.get(`${API_URL}/organizer/players`);
        
        // Set empty initial values instead of dummy data
        setStats({
          totalTournaments: 0,
          activeTournaments: 0,
          ongoingTournaments: 0,
          completedTournaments: 0,
          totalPlayers: 0,
          activePlayers: 0,
          inactivePlayers: 0,
          recentPlayers: []
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Set empty values on error as well
        setStats({
          totalTournaments: 0,
          activeTournaments: 0,
          ongoingTournaments: 0,
          completedTournaments: 0,
          totalPlayers: 0,
          activePlayers: 0,
          inactivePlayers: 0,
          recentPlayers: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="text-gray-600 mb-6">{currentDate}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tournaments Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-5">
            <div className="p-3 rounded-full bg-blue-100 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Tournaments</h2>
            <div className="ml-auto text-3xl font-bold text-gray-700">{isLoading ? '...' : stats.totalTournaments}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? '...' : stats.activeTournaments}</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Ongoing</span>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? '...' : stats.ongoingTournaments}</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? '...' : stats.completedTournaments}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">RECENT TOURNAMENTS</h3>
            <div className="space-y-1">
              {isLoading ? (
                <>
                  <div className="animate-pulse h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                </>
              ) : (
                <p className="text-sm text-gray-500 py-2">No recent tournaments</p>
              )}
            </div>
          </div>
          
          <a href="/organizer/tournaments" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View all tournaments →
          </a>
        </div>
        
        {/* Players Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-5">
            <div className="p-3 rounded-full bg-indigo-100 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Players</h2>
            <div className="ml-auto text-3xl font-bold text-gray-700">{isLoading ? '...' : stats.totalPlayers}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? '...' : stats.activePlayers}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Inactive</span>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? '...' : stats.inactivePlayers}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">RECENT PLAYERS</h3>
            <div className="space-y-1">
              {isLoading ? (
                <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
              ) : stats.recentPlayers && stats.recentPlayers.length > 0 ? (
                stats.recentPlayers.slice(0, 3).map(player => (
                  <div key={player.id} className="flex justify-between items-center text-sm py-1">
                    <span className="font-medium text-gray-700">{player.name}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">{formatDate(player.joinedDate)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">No recent players</p>
              )}
            </div>
          </div>
          
          <a href="/organizer/players" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View all players →
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;