import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const transactionId = urlParams.get('id');
        const statusCode = urlParams.get('code') || urlParams.get('status');
        
        if (!transactionId) {
          toast.error('Missing transaction details');
          navigate('/organizer/register-team');
          return;
        }

        // Get pending team registration data
        const pendingTeamData = localStorage.getItem('pendingTeamRegistration');
        if (!pendingTeamData) {
          toast.error('No pending registration found');
          navigate('/organizer/register-team');
          return;
        }

        if (statusCode === 'PAYMENT_SUCCESS' || statusCode === 'SUCCESS') {
          const teamData = JSON.parse(pendingTeamData);
          
          // Create form data for team registration
          let formData = new FormData();
          formData.append('teamName', teamData.name);
          formData.append('captainName', teamData.captainName);
          formData.append('captainEmail', teamData.captainEmail);
          formData.append('captainPhone', teamData.captainPhone);
          formData.append('tournamentId', teamData.tournamentId);
          formData.append('paymentMethod', 'online');
          formData.append('paymentStatus', 'completed');
          formData.append('paymentDetails', transactionId);
          formData.append('members', JSON.stringify(teamData.members));
          
          // Register the team
          await axios.post(
            `${API_URL}/tournaments/register-team/organizer`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${user?.token}`
              }
            }
          );

          sessionStorage.setItem('teamRegistrationSuccess', 'Your team has been registered successfully!');
          
          // Clear stored data
          localStorage.removeItem('pendingTeamRegistration');
          localStorage.removeItem('currentPaymentTxnId');
        }

        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
          navigate('/organizer/register-team');
        }, 5000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error(error.response?.data?.message || 'Failed to process registration');
        navigate('/organizer/register-team');
      }
    };

    verifyPayment();
  }, [location.search, navigate, user?.token, API_URL]);

  // Extract payment status from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const statusCode = urlParams.get('code') || urlParams.get('status');
  const isSuccess = statusCode === 'PAYMENT_SUCCESS' || statusCode === 'SUCCESS';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {isSuccess ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Your team registration payment has been processed successfully. You will be redirected back to the registration page.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <FiXCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Payment Failed</h1>
            <p className="text-gray-600 mb-8">
              We couldn't process your payment. Please try again or contact support if the issue persists.
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/organizer/register-team')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Registration
            <FiArrowRight className="ml-2" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 text-center mt-6">
          You will be automatically redirected in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default ThankYou;