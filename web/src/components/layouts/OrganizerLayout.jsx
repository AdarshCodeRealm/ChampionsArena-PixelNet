import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { useState, useEffect } from 'react';
import axios from 'axios';

const OrganizerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    completedTournaments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Format current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }));
    
    // Fetch stats data
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        
        // Get tournament stats for this organizer
        try {
          const tournamentsRes = await axios.get(`${API_URL}/tournaments/organizer-stats`);
          if (tournamentsRes.data && tournamentsRes.data.data) {
            const tournamentData = tournamentsRes.data.data;
            setStats(prevStats => ({
              ...prevStats,
              totalTournaments: tournamentData.totalTournaments || 0,
              activeTournaments: tournamentData.activeTournaments || 0,
              completedTournaments: tournamentData.completedTournaments || 0
            }));
          }
        } catch (err) {
          console.log('Error fetching tournament stats:', err);
        }
        
        // Get player stats
        try {
          const playersRes = await axios.get(`${API_URL}/tournaments/player-stats`);
          if (playersRes.data && playersRes.data.data) {
            const playerData = playersRes.data.data;
            setStats(prevStats => ({
              ...prevStats,
              totalPlayers: playerData.totalPlayers || 0,
              activePlayers: playerData.activePlayers || 0
            }));
          }
        } catch (err) {
          console.log('Error fetching player stats:', err);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  // Helper to check if a path is active
  const isActive = (path) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  
  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden m-0 p-0" style={{margin:0,padding:0,position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden'}}>
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col shadow-lg overflow-y-auto max-h-screen relative sidebar-scrollbar" style={{minHeight:'100vh',margin:0,padding:0}}>
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
            <div className="ml-5">
              <h2 className="text-xl font-bold text-white">Champions Arena</h2>
              <p className="text-xs text-blue-400">Organizer Panel</p>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-grow">
          <div className="space-y-3">
            <Link to="/organizer" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="ml-3">Dashboard</span>
            </Link>
            <Link to="/organizer/tournaments/create" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer/tournaments/create')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="ml-3">Create Tournament</span>
            </Link>
            <Link to="/organizer/tournaments" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer/tournaments')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="ml-3">Manage Tournaments</span>
            </Link>
            <Link to="/organizer/register-team" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer/register-team')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="ml-3">Register Team</span>
            </Link>
            <Link to="/organizer/team-registration" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer/team-registration')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="ml-3">Team Registration List</span>
            </Link>
            <Link to="/organizer/payment-gateway" className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/organizer/payment-gateway')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="ml-3">Payment Gateway</span>
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-500">{currentDate}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 bg-gray-100">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold">Total Players</h2>
                <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalPlayers}</p>
              </div>
              <div className="bg-blue-500 text-white rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold">Active Players</h2>
                <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.activePlayers}</p>
              </div>
              <div className="bg-green-500 text-white rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold">Total Tournaments</h2>
                <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalTournaments}</p>
              </div>
              <div className="bg-yellow-500 text-white rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold">Active Tournaments</h2>
                <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.activeTournaments}</p>
              </div>
              <div className="bg-green-500 text-white rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold">Completed Tournaments</h2>
                <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.completedTournaments}</p>
              </div>
              <div className="bg-red-500 text-white rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;