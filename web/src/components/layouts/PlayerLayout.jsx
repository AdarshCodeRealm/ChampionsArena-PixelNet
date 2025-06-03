import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';

const PlayerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <div className="flex h-screen bg-[#121212]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] text-white overflow-y-auto max-h-screen relative sidebar-scrollbar">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <SportsTennisIcon className="text-[#ff5e5e]" />
            <h2 className="text-xl font-bold">Clubima</h2>
          </div>
        </div>
        
        <nav className="mt-6">
          <Link 
            to="/player" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <DashboardIcon className="mr-3" fontSize="small" />
            <span>Schedule</span>
          </Link>
          <Link 
            to="/player/payment" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <PaymentIcon className="mr-3" fontSize="small" />
            <span>Payment</span>
          </Link>
          <Link 
            to="/player/players" 
            className="flex items-center px-5 py-3 bg-[#2a2a2a] text-white"
          >
            <PeopleAltIcon className="mr-3" fontSize="small" />
            <span>Players</span>
          </Link>
          <Link 
            to="/player/trainers" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <PersonIcon className="mr-3" fontSize="small" />
            <span>Trainers</span>
          </Link>
          <Link 
            to="/player/plans" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <SportsCricketIcon className="mr-3" fontSize="small" />
            <span>Membership Plans</span>
          </Link>
          <Link 
            to="/player/administration" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <SettingsIcon className="mr-3" fontSize="small" />
            <span>Administration</span>
          </Link>
          <Link 
            to="/player/employees" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <PeopleAltIcon className="mr-3" fontSize="small" />
            <span>Employees</span>
          </Link>
          <Link 
            to="/player/settings" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <SettingsIcon className="mr-3" fontSize="small" />
            <span>Club Setting</span>
          </Link>
          <Link 
            to="/player/branches" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <LocationOnIcon className="mr-3" fontSize="small" />
            <span>Branches</span>
          </Link>
          <Link 
            to="/player/courts" 
            className="flex items-center px-5 py-3 hover:bg-[#2a2a2a] text-gray-300 hover:text-white"
          >
            <SportsVolleyballIcon className="mr-3" fontSize="small" />
            <span>Courts</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-5 left-0 w-64 px-5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 text-center text-white bg-[#ff5e5e] rounded hover:bg-[#ff3a3a]"
          >
            <LogoutIcon className="mr-2" fontSize="small" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto bg-[#121212] text-white">
        <Outlet />
      </div>
    </div>
  );
};

export default PlayerLayout;