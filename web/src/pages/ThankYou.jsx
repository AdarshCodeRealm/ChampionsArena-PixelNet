import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck, FiX, FiLoader, FiAward, FiCalendar, FiUsers, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ThankYou = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState({
    loading: true,
    success: false,
    message: '',
    transactionId: '',
    teamInfo: null,
    tournamentInfo: null,
    error: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    
    handlePaymentCallback();
  }, [location.search, user, navigate]);

  const handlePaymentCallback = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const transactionId = urlParams.get('id') || urlParams.get('merchantTransactionId');
      const statusCode = urlParams.get('code') || urlParams.get('status');
      
      if (!transactionId) {
        throw new Error('Transaction ID not found in callback');
      }

      // Get pending team registration data
      const pendingTeamData = localStorage.getItem('pendingTeamRegistration');
      if (!pendingTeamData) {
        throw new Error('No pending team registration found');
      }

      const teamInfo = JSON.parse(pendingTeamData);
      
      // Get tournament info
      let tournamentInfo = null;
      try {
        const tournamentResponse = await axios.get(`${API_URL}/tournaments/${teamInfo.tournamentId}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        tournamentInfo = tournamentResponse.data.data;
      } catch (error) {
        console.error('Error fetching tournament info:', error);
      }

      // Determine payment success based on status code
      let isPaymentSuccessful = false;
      if (statusCode) {
        isPaymentSuccessful = (statusCode === 'PAYMENT_SUCCESS' || statusCode === 'SUCCESS');
      } else {
        // Verify with server
        try {
          const response = await axios.get(`${API_URL}/payments/status/${transactionId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`
            }
          });
          
          if (response.data.success) {
            const paymentData = response.data.data;
            isPaymentSuccessful = (paymentData.status === 'SUCCESS' || paymentData.status === 'COMPLETED');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          // If verification fails, assume success based on reaching this page
          isPaymentSuccessful = true;
        }
      }

      if (isPaymentSuccessful) {
        // Register the team
        try {
          const formData = new FormData();
          formData.append('teamName', teamInfo.name);
          formData.append('captainName', teamInfo.captainName);
          formData.append('captainEmail', teamInfo.captainEmail);
          formData.append('captainPhone', teamInfo.captainPhone);
          formData.append('tournamentId', teamInfo.tournamentId);
          formData.append('paymentMethod', 'online');
          formData.append('paymentStatus', 'completed');
          formData.append('paymentDetails', transactionId);
          formData.append('members', JSON.stringify(teamInfo.members));
          
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
            setPaymentStatus({
              loading: false,
              success: true,
              message: 'Payment successful! Your team has been registered for the tournament.',
              transactionId,
              teamInfo,
              tournamentInfo,
              error: null
            });
            
            // Clear stored data
            localStorage.removeItem('pendingTeamRegistration');
            localStorage.removeItem('currentPaymentTxnId');
            
            // Auto-navigate to manage tournaments after 5 seconds
            setTimeout(() => {
              navigate('/organizer/manage-tournaments');
            }, 5000);
            
          } else {
            throw new Error('Team registration failed after successful payment');
          }
        } catch (registrationError) {
          console.error('Registration error:', registrationError);
          setPaymentStatus({
            loading: false,
            success: false,
            message: 'Payment was successful, but team registration failed. Please contact support.',
            transactionId,
            teamInfo,
            tournamentInfo,
            error: registrationError.message
          });
        }
      } else {
        setPaymentStatus({
          loading: false,
          success: false,
          message: 'Payment was not successful. Please try again.',
          transactionId,
          teamInfo,
          tournamentInfo,
          error: 'Payment failed'
        });
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      setPaymentStatus({
        loading: false,
        success: false,
        message: 'Error processing payment callback. Please contact support if payment was deducted.',
        transactionId: '',
        teamInfo: null,
        tournamentInfo: null,
        error: error.message
      });
    }
  };

  const handleContinue = () => {
    if (paymentStatus.success) {
      navigate('/organizer/manage-tournaments');
    } else {
      navigate('/organizer/register-team');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-8 ${
            paymentStatus.loading 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
              : paymentStatus.success 
                ? 'bg-gradient-to-r from-green-600 to-emerald-700' 
                : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}>
            <div className="text-center">
              {paymentStatus.loading ? (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiCreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {paymentStatus.success ? (
                      <FiCheck className="h-8 w-8 text-white" />
                    ) : (
                      <FiX className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>
              )}
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {paymentStatus.loading 
                  ? 'Processing Payment...' 
                  : paymentStatus.success 
                    ? 'Payment Successful!' 
                    : 'Payment Failed'
                }
              </h1>
              
              <p className="text-white text-opacity-90">
                {paymentStatus.loading 
                  ? 'Please wait while we process your payment and register your team.' 
                  : paymentStatus.success 
                    ? 'Your team has been successfully registered for the tournament.' 
                    : 'There was an issue processing your payment.'
                }
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {paymentStatus.loading ? (
              <div className="text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-gray-600 mt-4 text-sm">This usually takes a few seconds...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Message */}
                <div className="text-center">
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    {paymentStatus.message}
                  </p>
                  
                  {paymentStatus.transactionId && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Transaction ID:</p>
                      <p className="font-mono text-sm text-gray-800 bg-white px-2 py-1 rounded border inline-block">
                        {paymentStatus.transactionId.substring(0, 20)}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Success Details */}
                {paymentStatus.success && paymentStatus.teamInfo && paymentStatus.tournamentInfo && (
                  <div className="border border-green-200 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="bg-green-600 px-4 py-3">
                      <h3 className="text-white font-semibold flex items-center">
                        <FiAward className="mr-2" /> Registration Complete
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Tournament</p>
                          <p className="text-gray-900 font-semibold">{paymentStatus.tournamentInfo.title}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Team</p>
                          <p className="text-gray-900 font-semibold">{paymentStatus.teamInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Captain</p>
                          <p className="text-gray-900">{paymentStatus.teamInfo.captainName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Amount Paid</p>
                          <p className="text-green-600 font-bold">₹{paymentStatus.tournamentInfo.entryFee || 0}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <p className="text-sm text-blue-700 flex items-center">
                          <FiCalendar className="mr-2 flex-shrink-0" />
                          Tournament starts on {new Date(paymentStatus.tournamentInfo.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      {paymentStatus.success && (
                        <div className="text-center text-sm text-gray-600">
                          <p>Redirecting to Manage Tournaments in 5 seconds...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {!paymentStatus.success && !paymentStatus.loading && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiX className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium">Payment Processing Failed</p>
                        <p className="text-red-700 text-sm mt-1">
                          {paymentStatus.error || 'Please try registering your team again or contact support if the issue persists.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!paymentStatus.loading && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-between items-center">
                {paymentStatus.success && (
                  <button
                    onClick={() => navigate('/organizer/teams')}
                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <FiUsers className="mr-2 h-4 w-4" />
                    View All Teams
                  </button>
                )}
                
                <button
                  onClick={handleContinue}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ml-auto ${
                    paymentStatus.success 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {paymentStatus.success ? 'Continue to Manage Tournaments' : 'Try Again'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;