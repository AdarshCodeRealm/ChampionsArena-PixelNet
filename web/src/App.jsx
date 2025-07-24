import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import CreateOrganizer from './pages/admin/CreateOrganizer';
import MatchManagement from './pages/admin/MatchManagement';
import AllPlayers from './pages/admin/AllPlayers';
import ApprovedOrganizers from './pages/admin/ApprovedOrganizers';
import AllTournaments from './pages/admin/AllTournaments';

// Organizer Pages
import ManageTournaments from './pages/organizer/ManageTournaments';
import TeamRegistration from './pages/organizer/TeamRegistration';
import RegisterTeam from './pages/organizer/RegisterTeam';
import PaymentGateway from './pages/organizer/PaymentGateway';
import PaymentStatus from './pages/organizer/PaymentStatus';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import OrganizerLayout from './components/layouts/OrganizerLayout';

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';

import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerCreateTournament from './pages/organizer/CreateTournament';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
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
              <Route path="organizers/approved" element={<ApprovedOrganizers />} />
              <Route path="match-management" element={<MatchManagement />} />
              <Route path="players" element={<AllPlayers />} />
              <Route path="tournaments" element={<AllTournaments />} />
            </Route>
            
            {/* Organizer routes */}
            <Route path="/organizer/*" element={
              <ProtectedRoute userType="organizer">
                <OrganizerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OrganizerDashboard />} />
              <Route path="dashboard" element={<OrganizerDashboard />} />
              <Route path="tournaments" element={<ManageTournaments />} />
              <Route path="tournaments/create" element={<OrganizerCreateTournament />} />
              {/* Team registration routes */}
              <Route path="register-team" element={<RegisterTeam />} />
              <Route path="team-registration" element={<TeamRegistration />} />
              {/* Payment routes */}
              <Route path="payment-gateway" element={<PaymentGateway />} />
              <Route path="payment-status" element={<PaymentStatus />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
