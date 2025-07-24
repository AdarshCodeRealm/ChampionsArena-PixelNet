import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import logo from '../../assets/logo.png';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    pendingOrganizers: 0,
    approvedOrganizers: 0,
    totalTournaments: 0,
    activeTournaments: 0
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
        
        // Get pending organizers count - handling potential API errors gracefully
        try {
          const pendingRes = await axios.get(`${API_URL}/admin/organizers/pending`);
          stats.pendingOrganizers = pendingRes.data.data?.length || 0;
        } catch (err) {
          console.log('Error fetching pending organizers:', err);
        }
        
        // Get approved organizers count - handling potential API errors gracefully
        try {
          const approvedRes = await axios.get(`${API_URL}/admin/organizers/approved`);
          stats.approvedOrganizers = approvedRes.data.data?.length || 0;
        } catch (err) {
          console.log('Error fetching approved organizers:', err);
        }
        
        // In a real application, we would also fetch tournament data
        setStats({
          ...stats,
          totalTournaments: 0,  // This would come from tournaments endpoint when available
          activeTournaments: 0  // This would come from tournaments endpoint when available
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };
  
  // Add a useEffect to modify the body and html style to remove any default margins/padding
  useEffect(() => {
    // Remove default margins from html and body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Clean up function
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  
  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden m-0 p-0" 
         style={{
           margin: 0, 
           padding: 0, 
           position: 'absolute', 
           top: 0, 
           left: 0, 
           right: 0, 
           bottom: 0,
           overflow: 'hidden'
         }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col shadow-lg overflow-y-auto max-h-screen relative sidebar-scrollbar`}
        style={{minHeight: '100vh', margin: 0, padding: 0}}
      >
        {/* Logo and brand */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg ring-4 ring-blue-400">
              <img src={logo} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
            </div>
            {sidebarOpen && (
              <div className="ml-5">
                <h2 className="text-xl font-bold text-white">Champions Arena</h2>
                <p className="text-xs text-blue-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>
        
        {/* User profile section */}
        <div className="p-5 border-b border-gray-700">
          <div className={`flex ${!sidebarOpen && 'justify-center'} items-center`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation menu */}
        <nav className="p-4 flex-grow">
          <div className="space-y-3">
            <Link 
              to="/admin" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </div>
            </Link>
            
            <Link 
              to="/admin/organizers/pending" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/organizers/pending')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Pending Organizers</span>}
              </div>
            </Link>
            
            <Link 
              to="/admin/organizers/create" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/organizers/create')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {sidebarOpen && <span className="ml-3">Create Organizer</span>}
              </div>
            </Link>
            
            <Link 
              to="/admin/organizers/approved" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/organizers/approved')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Approved Organizers</span>}
              </div>
            </Link>

            <Link 
              to="/admin/tournaments" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/tournaments')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Tournaments</span>}
              </div>
            </Link>
            
            <Link 
              to="/admin/players" 
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/players')}`}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {sidebarOpen && <span className="ml-3">All Players</span>}
              </div>
            </Link>
          </div>
        </nav>
        
        {/* Toggle button */}
        <div className="px-4 py-2 flex justify-center border-t border-gray-700">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Logout button */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && "Logout"}
          </button>
          {sidebarOpen && (
            <div className="text-xs text-center mt-3 text-gray-400">
              {currentDate}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {location.pathname === '/admin' && 'Dashboard'}
                {location.pathname === '/admin/organizers/pending' && 'Pending Organizers'}
                {location.pathname === '/admin/organizers/approved' && 'Approved Organizers'}
                {location.pathname === '/admin/tournaments' && 'Tournaments'}
              </h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {/* Pending Organizers Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Organizers</p>
                <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.pendingOrganizers}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/organizers/pending" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all pending requests →</Link>
            </div>
          </div>
          
          {/* Approved Organizers Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Approved Organizers</p>
                <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.approvedOrganizers}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/organizers/approved" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all organizers →</Link>
            </div>
          </div>
          
          {/* Total Tournaments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
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
            <div className="mt-4">
              <Link to="/admin/tournaments" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all tournaments →</Link>
            </div>
          </div>
          
          {/* Active Tournaments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Tournaments</p>
                <p className="text-2xl font-bold text-gray-700">{isLoading ? '...' : stats.activeTournaments}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/tournaments" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View active tournaments →</Link>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;