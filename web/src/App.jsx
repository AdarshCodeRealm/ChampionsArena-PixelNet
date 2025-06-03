import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import CreateOrganizer from './pages/admin/CreateOrganizer';
import MatchManagement from './pages/admin/MatchManagement';
import AllPlayers from './pages/admin/AllPlayers';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import OrganizerLayout from './components/layouts/OrganizerLayout';

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute userType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div className="p-0">
                {/* Dashboard content is now part of the AdminLayout */}
              </div>} />
              <Route path="organizers/create" element={<CreateOrganizer />} />
              <Route path="organizers/pending" element={<div className="p-0">
                <h2 className="text-xl font-bold mb-4">Pending Organizer Requests</h2>
                <p className="text-gray-500">No pending organizer requests found.</p>
              </div>} />
              <Route path="organizers/approved" element={<div className="p-0">
                <h2 className="text-xl font-bold mb-4">Approved Organizers</h2>
                <p className="text-gray-500">No approved organizers found.</p>
              </div>} />
              <Route path="tournaments" element={<div className="p-0">
                <h2 className="text-xl font-bold mb-4">All Tournaments</h2>
                <p className="text-gray-500">No tournaments found.</p>
              </div>} />
              {/* Adding route for All Players */}
              <Route path="players" element={<AllPlayers />} />
            </Route>
            
            {/* Organizer routes */}
            <Route path="/organizer" element={
              <ProtectedRoute userType="organizer">
                <OrganizerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div className="p-0">Organizer Dashboard</div>} />
              <Route path="tournaments" element={<div className="p-0">My Tournaments</div>} />
              <Route path="tournaments/create" element={<div className="p-6">Create Tournament</div>} />
              {/* Added matches route to organizer section */}
              <Route path="matches" element={<MatchManagement />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
