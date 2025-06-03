import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { user, loading, isAdmin, isOrganizer } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if the user has the right type to access this route
  if (userType === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  if (userType === 'organizer' && !isOrganizer) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;