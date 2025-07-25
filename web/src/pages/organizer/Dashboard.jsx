import { useEffect, useState } from 'react';
import axios from 'axios';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    completedTournaments: 0,
    totalMatches: 0,
    totalPlayers: 0,
    activePlayers: 0,
    recentPlayers: []
  });
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Demo data for now:
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          completedTournaments: 3,
          totalMatches: 12,
          totalPlayers: 48,
          activePlayers: 32,
          recentPlayers: [
            { id: 1, name: "Raj Kumar", game: "BGMI", joinedDate: "2025-07-20" },
            { id: 2, name: "Priya Singh", game: "Free Fire", joinedDate: "2025-07-22" },
            { id: 3, name: "Aditya Verma", game: "COD Mobile", joinedDate: "2025-07-23" }
          ]
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // fallback to demo data
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          completedTournaments: 3,
          totalMatches: 12,
          totalPlayers: 48,
          activePlayers: 32,
          recentPlayers: [
            { id: 1, name: "Raj Kumar", game: "BGMI", joinedDate: "2025-07-20" },
            { id: 2, name: "Priya Singh", game: "Free Fire", joinedDate: "2025-07-22" },
            { id: 3, name: "Aditya Verma", game: "COD Mobile", joinedDate: "2025-07-23" }
          ]
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
    <div className="p-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Organizer Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Tournaments Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tournaments</p>
              <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.totalTournaments}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Active</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 ml-5">
                {isLoading ? '...' : stats.activeTournaments}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs font-medium text-gray-600">Completed</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 ml-5">
                {isLoading ? '...' : stats.completedTournaments}
              </p>
            </div>
          </div>
          
          <a href="/organizer/tournaments" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View all tournaments →
          </a>
        </div>
        
        {/* Total Players Card (Replaced Active Tournaments) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Players</p>
              <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.totalPlayers}</p>
            </div>
          </div>
          
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Recent Players</h3>
          <div className="space-y-2">
            {isLoading ? (
              <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
            ) : stats.recentPlayers && stats.recentPlayers.length > 0 ? (
              stats.recentPlayers.slice(0, 3).map(player => (
                <div key={player.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-700">{player.name}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{player.game}</span>
                    <span className="text-xs text-gray-400">{formatDate(player.joinedDate)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No recent players</p>
            )}
          </div>
          
          <a href="/organizer/players" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
            View all players →
          </a>
        </div>
        
        {/* Total Matches Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Matches</p>
            <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.totalMatches}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;