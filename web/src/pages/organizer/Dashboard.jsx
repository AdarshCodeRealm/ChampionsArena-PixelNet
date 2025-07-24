import { useEffect, useState } from 'react';
import axios from 'axios';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalMatches: 0,
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
        // setStats({
        //   totalTournaments: tournamentsRes.data.data.length,
        //   activeTournaments: tournamentsRes.data.data.filter(t => t.status === 'active').length,
        //   totalMatches: matchesRes.data.data.length,
        // });
        // Demo data for now:
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          totalMatches: 12,
        });
      } catch (err) {
        // fallback to demo data
        setStats({
          totalTournaments: 5,
          activeTournaments: 2,
          totalMatches: 12,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Organizer Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Tournaments Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
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
        {/* Active Tournaments Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Tournaments</p>
            <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.activeTournaments}</p>
          </div>
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