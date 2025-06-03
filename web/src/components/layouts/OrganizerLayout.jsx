import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OrganizerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white overflow-y-auto max-h-screen relative sidebar-scrollbar">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Champions Arena</h2>
          <p className="text-sm text-gray-400">Organizer Dashboard</p>
        </div>
        
        <nav className="mt-8">
          <Link 
            to="/organizer" 
            className="block py-2.5 px-4 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link 
            to="/organizer/tournaments/create" 
            className="block py-2.5 px-4 hover:bg-gray-700"
          >
            Create Tournament
          </Link>
          <Link 
            to="/organizer/tournaments" 
            className="block py-2.5 px-4 hover:bg-gray-700"
          >
            Manage Tournaments
          </Link>
          <Link 
            to="/organizer/matches" 
            className="block py-2.5 px-4 hover:bg-gray-700"
          >
            Manage Matches
          </Link>
        </nav>
        
        <div className="absolute bottom-0 p-4">
          <button 
            onClick={handleLogout}
            className="w-full py-2 text-center text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-3">
            <h1 className="text-2xl font-semibold text-gray-800">Organizer Dashboard</h1>
          </div>
        </header>
        
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;