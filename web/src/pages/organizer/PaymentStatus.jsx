import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:8000/api/v1';

const PaymentStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: 'Verifying payment status...',
    details: null
  });
  const [teamRegistered, setTeamRegistered] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPaymentAndRegisterTeam = async () => {
      try {
        // Get transaction ID from localStorage or URL params
        const params = new URLSearchParams(location.search);
        const merchantTransactionId = params.get('merchantTransactionId') || localStorage.getItem('currentPaymentTxnId');
        const transactionId = params.get('transactionId');
        const paymentStatus = params.get('code') || params.get('status');
        
        if (!merchantTransactionId && !transactionId) {
          setStatus({
            loading: false,
            success: false,
            message: 'No transaction ID found. Unable to verify payment.',
            details: null
          });
          return;
        }

        // Get pending team registration data
        const pendingTeamData = localStorage.getItem('pendingTeamRegistration');
        if (!pendingTeamData) {
          setStatus(prev => ({
            ...prev,
            message: prev.message + ' No team registration data found.'
          }));
        }
        
        // If we have payment response directly in URL params
        let isPaymentSuccessful = false;
        if (paymentStatus) {
          isPaymentSuccessful = (paymentStatus === 'PAYMENT_SUCCESS' || paymentStatus === 'SUCCESS');
          
          setStatus({
            loading: false,
            success: isPaymentSuccessful,
            message: isPaymentSuccessful 
              ? 'Payment successful!' 
              : `Payment ${paymentStatus.toLowerCase()}. Please try again.`,
            details: {
              merchantTransactionId,
              transactionId,
              status: paymentStatus
            }
          });
        } else {
          // Verify with the server
          const response = await axios.get(
            `${API_URL}/payments/status/${merchantTransactionId}`, 
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
              }
            }
          );
          
          if (response.data.success) {
            const paymentData = response.data.data;
            isPaymentSuccessful = (paymentData.status === 'SUCCESS' || paymentData.status === 'COMPLETED');
            
            setStatus({
              loading: false,
              success: isPaymentSuccessful,
              message: isPaymentSuccessful 
                ? 'Payment successful!' 
                : `Payment ${paymentData.status.toLowerCase()}. Please try again.`,
              details: paymentData
            });
          } else {
            setStatus({
              loading: false,
              success: false,
              message: 'Failed to verify payment status.',
              details: null
            });
          }
        }
        
        // If payment was successful, register the team
        if (isPaymentSuccessful && pendingTeamData) {
          try {
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
            formData.append('paymentDetails', merchantTransactionId);
            formData.append('members', JSON.stringify(teamData.members));
            
            // Register the team
            const registerResponse = await axios.post(
              `${API_URL}/tournaments/register-team/organizer`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${user?.token}`
                }
              }
            );
            
            if (registerResponse.data.success) {
              setTeamRegistered(true);
              setStatus(prev => ({
                ...prev,
                message: prev.message + ' Team registered successfully!'
              }));
              
              // Store success message in sessionStorage to display on register team page
              sessionStorage.setItem('teamRegistrationSuccess', 'Team registered successfully!');
              
              // Redirect back to register team page after a short delay
              setTimeout(() => {
                navigate('/organizer/register-team');
              }, 1500);
            } else {
              toast.error('Payment successful but team registration failed.');
            }
          } catch (error) {
            console.error('Team registration error:', error);
            toast.error('Payment successful but team registration failed. Please contact support.');
          }
        }
        
        // Clear stored data
        localStorage.removeItem('currentPaymentTxnId');
        localStorage.removeItem('pendingTeamRegistration');
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus({
          loading: false,
          success: false,
          message: 'Error verifying payment status.',
          details: null
        });
      }
    };
    
    verifyPaymentAndRegisterTeam();
  }, [location.search, user?.token, navigate]);

  const handleBack = () => {
    navigate('/organizer/register-team');
  };

  const handleDashboard = () => {
    navigate('/organizer/dashboard');
  };
  
  // If we're still loading, show a spinner
  if (status.loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin mx-auto h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Verifying payment status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r p-6 ${status.success ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'}`}>
          <h1 className="text-white text-2xl font-bold">Payment {status.success ? 'Successful' : 'Status'}</h1>
          <p className="text-white opacity-90 mt-2">Transaction details</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            {status.success ? (
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">{status.message}</h2>

          {status.details && (
            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Transaction Details</h3>
              <div className="space-y-2">
                {status.details.merchantTransactionId && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Order ID:</span> {status.details.merchantTransactionId}
                  </p>
                )}
                {status.details.transactionId && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Transaction ID:</span> {status.details.transactionId}
                  </p>
                )}
                {status.details.amount && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Amount:</span> ₹{status.details.amount}
                  </p>
                )}
                {status.details.status && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span> {status.details.status}
                  </p>
                )}
              </div>
            </div>
          )}

          {status.success && teamRegistered && (
            <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-green-800">Team Registration Complete</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your team has been successfully registered for the tournament.
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Redirecting back to team registration...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {!status.success && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium shadow-sm transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                Try Again
              </button>
            )}
            
            <button
              onClick={handleDashboard}
              className={`flex-1 py-3 px-4 ${status.success ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-medium shadow-sm transition-colors duration-200 flex items-center justify-center`}
            >
              Go to Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;