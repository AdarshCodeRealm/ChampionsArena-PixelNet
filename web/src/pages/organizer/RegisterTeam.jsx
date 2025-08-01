import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiUsers, FiDollarSign, FiCreditCard, FiCheck, FiX, FiLoader, FiAward, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const RegisterTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [teamData, setTeamData] = useState({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    members: [{ uid: '' }] // Changed to only take UID
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Tournament, 2: Team, 3: Payment
  const [isLandscapeMode, setIsLandscapeMode] = useState(window.innerWidth > window.innerHeight);
  // Payment status popup
  const [paymentStatusPopup, setPaymentStatusPopup] = useState({
    show: false,
    success: false,
    message: '',
    transactionId: '',
    loading: false,
    tournamentInfo: null,
    teamInfo: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  // Detect screen orientation
  useEffect(() => {
    const handleResize = () => {
      setIsLandscapeMode(window.innerWidth > window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check URL query params for payment status
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const transactionId = urlParams.get('id');
    const merchantTransactionId = urlParams.get('merchantTransactionId');
    const statusCode = urlParams.get('code') || urlParams.get('status');
    
    // If we have payment related parameters in URL
    if (transactionId || merchantTransactionId || statusCode) {
      handlePaymentResponse(transactionId || merchantTransactionId, statusCode);
    }
    
    // Check for registration success message from payment process
    const successMessage = sessionStorage.getItem('teamRegistrationSuccess');
    if (successMessage) {
      toast.success(successMessage);
      setRegistrationSuccess(true);
      // Clear the success message from session storage
      sessionStorage.removeItem('teamRegistrationSuccess');
    }
  }, [location.search]);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const selected = tournaments.find(t => t._id === selectedTournament);
      if (selected) {
        setEntryFee(selected.entryFee || 0);
      }
    }
  }, [selectedTournament, tournaments]);

  const handlePaymentResponse = async (transactionId, statusCode) => {
    // Clear query parameters from URL without refreshing the page
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (!transactionId) {
      toast.error("Transaction ID missing. Unable to verify payment status.");
      return;
    }
    
    // Show the payment status popup with loading state
    setPaymentStatusPopup({
      show: true,
      loading: true,
      success: false,
      message: "Verifying payment status...",
      transactionId,
      tournamentInfo: null,
      teamInfo: null
    });
    
    try {
      // Get pending team registration data
      const pendingTeamData = localStorage.getItem('pendingTeamRegistration');
      if (!pendingTeamData) {
        throw new Error("No team registration data found.");
      }
      
      const teamInfo = JSON.parse(pendingTeamData);
      let tournamentInfo = null;
      
      // Get tournament info for the popup
      if (teamInfo.tournamentId) {
        const selectedTournament = tournaments.find(t => t._id === teamInfo.tournamentId);
        if (selectedTournament) {
          tournamentInfo = selectedTournament;
        }
      }
      
      // If we have explicit status code in URL params
      let isPaymentSuccessful = false;
      if (statusCode) {
        isPaymentSuccessful = (statusCode === 'PAYMENT_SUCCESS' || statusCode === 'SUCCESS');
        
        setPaymentStatusPopup({
          show: true,
          loading: false,
          success: isPaymentSuccessful,
          message: isPaymentSuccessful ? 'Payment successful!' : 'Payment failed. Please try again.',
          transactionId,
          teamInfo: isPaymentSuccessful ? teamInfo : null,
          tournamentInfo: isPaymentSuccessful ? tournamentInfo : null
        });
      } else {
        // Verify with the server
        const response = await axios.get(
          `${API_URL}/payments/status/${transactionId}`, 
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
          
          setPaymentStatusPopup({
            show: true,
            loading: false,
            success: isPaymentSuccessful,
            message: isPaymentSuccessful ? 'Payment successful!' : `Payment ${paymentData.status.toLowerCase()}. Please try again.`,
            transactionId,
            teamInfo: isPaymentSuccessful ? teamInfo : null,
            tournamentInfo: isPaymentSuccessful ? tournamentInfo : null
          });
        } else {
          throw new Error("Failed to verify payment status.");
        }
      }
      
      // If payment was successful, register the team
      if (isPaymentSuccessful) {
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
          formData.append('paymentDetails', transactionId);
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
            setRegistrationSuccess(true);
            setPaymentStatusPopup(prev => ({
              ...prev,
              message: 'Your team has been registered successfully for the tournament!',
              teamInfo: {
                ...teamData,
                _id: registerResponse.data.data?._id || 'new-team',
                registeredAt: new Date().toISOString()
              }
            }));
            
            // Don't auto-close popup, let the user see their registration details
          } else {
            toast.error('Payment successful but team registration failed.');
          }
        } catch (error) {
          console.error('Team registration error:', error);
          toast.error('Payment successful but team registration failed. Please contact support.');
        }
      } else {
        // Hide popup after 5 seconds for failed payments
        setTimeout(() => {
          setPaymentStatusPopup({
            show: false,
            success: false,
            message: '',
            transactionId: '',
            loading: false,
            tournamentInfo: null,
            teamInfo: null
          });
        }, 5000);
      }
      
      // Clear stored data
      localStorage.removeItem('currentPaymentTxnId');
      localStorage.removeItem('pendingTeamRegistration');
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatusPopup({
        show: true,
        loading: false,
        success: false,
        message: 'Error verifying payment status.',
        transactionId,
        tournamentInfo: null,
        teamInfo: null
      });
      
      // Hide popup after 5 seconds
      setTimeout(() => {
        setPaymentStatusPopup({
          show: false,
          success: false,
          message: '',
          transactionId: '',
          loading: false,
          tournamentInfo: null,
          teamInfo: null
        });
      }, 5000);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tournaments/organizer/tournaments`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      // Filter out completed tournaments - only show active tournaments
      const activeTournaments = (response.data.data || []).filter(tournament => 
        tournament.status !== 'completed' && tournament.status !== 'cancelled'
      );
      
      setTournaments(activeTournaments);
      if (activeTournaments.length > 0) {
        setSelectedTournament(activeTournaments[0]._id);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error(error.response?.data?.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData({ ...teamData, [name]: value });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamData.members];
    updatedMembers[index][field] = value;
    setTeamData({ ...teamData, members: updatedMembers });
  };

  const addTeamMember = () => {
    setTeamData({
      ...teamData,
      members: [...teamData.members, { uid: '' }] // Changed to only take UID
    });
  };

  const removeTeamMember = (index) => {
    if (teamData.members.length === 1) {
      return toast.error('Team must have at least one member');
    }
    const updatedMembers = teamData.members.filter((_, i) => i !== index);
    setTeamData({ ...teamData, members: updatedMembers });
  };

  const resetForm = () => {
    setTeamData({
      name: '',
      captainName: '',
      captainEmail: '',
      captainPhone: '',
      members: [{ uid: '' }] // Changed to only take UID
    });
    setRegistrationSuccess(false);
  };

  // Custom Alert Component for Payment Status
  const CustomPaymentAlert = () => {
    if (!paymentStatusPopup.show) return null;
    
    const { tournamentInfo, teamInfo } = paymentStatusPopup;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fadeIn transform transition-all duration-300 scale-100">
          {/* Enhanced Header with Better Styling */}
          <div className={`p-6 ${paymentStatusPopup.loading ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 
                             paymentStatusPopup.success ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {paymentStatusPopup.loading ? (
                  <FiLoader className="h-8 w-8 text-white animate-spin mr-3" />
                ) : paymentStatusPopup.success ? (
                  <div className="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <FiCheck className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <FiX className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-white text-xl font-bold">
                    {paymentStatusPopup.loading ? 'Processing Payment' : 
                     paymentStatusPopup.success ? 'Payment Successful!' : 'Payment Failed'}
                  </h2>
                  <p className="text-white text-opacity-90 text-sm mt-1">
                    {paymentStatusPopup.loading ? 'Please wait while we verify your payment...' : 
                     paymentStatusPopup.success ? 'Your payment has been processed successfully!' : 'There was an issue with your payment'}
                  </p>
                </div>
              </div>
              {!paymentStatusPopup.loading && (
                <button 
                  onClick={() => {
                    setPaymentStatusPopup({
                      show: false, 
                      success: false, 
                      message: '', 
                      transactionId: '', 
                      loading: false,
                      tournamentInfo: null,
                      teamInfo: null
                    });
                    if (paymentStatusPopup.success) {
                      resetForm();
                    }
                  }}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <FiX size={20} className="text-white" />
                </button>
              )}
            </div>
          </div>
          
          {/* Enhanced Body Content */}
          <div className="p-6">
            {/* Loading State */}
            {paymentStatusPopup.loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiCreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="mt-6 text-gray-700 text-center font-medium">Verifying your payment...</p>
                <p className="mt-2 text-gray-500 text-sm text-center">This may take a few moments</p>
              </div>
            ) : (
              <>
                {/* Status Message */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    paymentStatusPopup.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {paymentStatusPopup.success ? (
                      <FiCheck className="h-10 w-10 text-green-600" />
                    ) : (
                      <FiX className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {paymentStatusPopup.success ? 'Team Successfully Registered!' : 'Payment Failed'}
                  </h3>
                  
                  <p className="text-gray-600">
                    {paymentStatusPopup.message}
                  </p>
                </div>
                
                {/* Transaction ID */}
                {paymentStatusPopup.transactionId && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                        {paymentStatusPopup.transactionId.substring(0, 18)}...
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Registration Details for Success */}
                {paymentStatusPopup.success && teamInfo && tournamentInfo && (
                  <div className="border border-green-200 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="bg-green-600 px-6 py-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <FiAward className="mr-2" /> Registration Complete
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Tournament</p>
                            <p className="text-gray-900 font-semibold">{tournamentInfo.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Team Name</p>
                            <p className="text-gray-900 font-semibold">{teamInfo.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Captain</p>
                            <p className="text-gray-900">{teamInfo.captainName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Team Members</p>
                            <p className="text-gray-900">{teamInfo.members?.length || 0} players</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Amount Paid</p>
                            <p className="text-green-600 font-bold text-lg">₹{tournamentInfo.entryFee || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                              Confirmed
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-green-200 pt-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-700 flex items-center font-medium">
                              <FiCalendar className="mr-2 flex-shrink-0" /> 
                              Tournament starts on {new Date(tournamentInfo.startDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Team Members List */}
                        {teamInfo.members && teamInfo.members.length > 0 && (
                          <div className="border-t border-green-200 pt-4">
                            <p className="text-sm text-gray-600 font-medium mb-2">Registered Players:</p>
                            <div className="bg-white p-3 rounded-lg border">
                              {teamInfo.members.map((member, index) => (
                                <div key={index} className="flex items-center py-1">
                                  <span className="text-sm text-gray-600 w-16">#{index + 1}</span>
                                  <span className="text-sm text-gray-800 font-mono">{member.uid}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error Details for Failed Payments */}
                {!paymentStatusPopup.success && !paymentStatusPopup.loading && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <FiX className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium">Payment could not be processed</p>
                        <p className="text-red-700 text-sm mt-1">Please try again or contact support if the issue persists.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Enhanced Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            {paymentStatusPopup.success && !paymentStatusPopup.loading && (
              <button 
                onClick={() => navigate('/organizer/teams')}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FiUsers className="mr-2 h-4 w-4" />
                View All Teams
              </button>
            )}
            
            <button 
              onClick={() => {
                setPaymentStatusPopup({
                  show: false, 
                  success: false, 
                  message: '', 
                  transactionId: '', 
                  loading: false,
                  tournamentInfo: null,
                  teamInfo: null
                });
                if (paymentStatusPopup.success) {
                  resetForm();
                }
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                paymentStatusPopup.success 
                  ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } ${paymentStatusPopup.loading ? 'opacity-50 cursor-not-allowed' : ''} ml-auto`}
              disabled={paymentStatusPopup.loading}
            >
              {paymentStatusPopup.loading ? 'Please Wait...' : paymentStatusPopup.success ? 'Register Another Team' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input fields
      if (!teamData.name || !teamData.captainName || !teamData.captainEmail || !teamData.captainPhone) {
        throw new Error('Please fill all required fields');
      }
      
      if (teamData.members.some(member => !member.uid)) {
        throw new Error('Please complete all team member details');
      }
      
      if (!selectedTournament) {
        throw new Error('Please select a tournament');
      }

      // Store team data in localStorage for retrieval after payment
      const teamDataForStorage = {
        name: teamData.name,
        captainName: teamData.captainName,
        captainEmail: teamData.captainEmail,
        captainPhone: teamData.captainPhone,
        tournamentId: selectedTournament,
        members: teamData.members.filter(member => member.uid)
      };
      
      localStorage.setItem('pendingTeamRegistration', JSON.stringify(teamDataForStorage));

      // Start payment process directly using the payment gateway
      const paymentData = {
        name: teamData.captainName,
        mobileNumber: teamData.captainPhone,
        amount: entryFee,
        description: `Registration fee for team ${teamData.name}`,
        callbackUrl: `${FRONTEND_URL}/thank-you` // Frontend thank you page that handles payment callbacks
      };
      
      // Initiate payment
      const paymentResponse = await axios.post(`${API_URL}/payments/phonepe/initiate`, paymentData, {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Redirect to payment URL
      if (paymentResponse.data.data && paymentResponse.data.data.paymentUrl) {
        // Store transaction ID for reference
        localStorage.setItem('currentPaymentTxnId', paymentResponse.data.data.transactionId);
        
        // Redirect to payment gateway
        window.location.href = paymentResponse.data.data.paymentUrl;
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 1 && !selectedTournament) {
      toast.error('Please select a tournament');
      return;
    }
    
    if (currentStep === 2) {
      if (!teamData.name || !teamData.captainName || !teamData.captainEmail || !teamData.captainPhone) {
        toast.error('Please fill all required captain fields');
        return;
      }
      
      if (teamData.members.some(member => !member.uid)) {
        toast.error('Please complete all team member details');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Layout components for desktop/landscape
  const ProgressSteps = () => (
    <div className="flex mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex-1">
          <div 
            className={`flex items-center ${currentStep === step ? 'text-blue-600' : currentStep > step ? 'text-green-600' : 'text-gray-400'}`}
            onClick={() => currentStep > step && setCurrentStep(step)}
          >
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 mr-2 cursor-pointer
              ${currentStep === step ? 'border-blue-600 bg-blue-100' : 
                currentStep > step ? 'border-green-600 bg-green-100' : 'border-gray-400'}`}>
              {currentStep > step ? '✓' : step}
            </div>
            <span className="font-medium">
              {step === 1 ? 'Tournament' : step === 2 ? 'Team Details' : 'Payment'}
            </span>
          </div>
          {step < 3 && <div className={`flex-1 border-t-2 my-4 ${currentStep > step ? 'border-green-600' : 'border-gray-300'}`}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Payment Status Popup */}
      <CustomPaymentAlert />
      
      {/* Success Message Banner */}
      {registrationSuccess && !paymentStatusPopup.show && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Team registration completed successfully! Payment has been processed.
              </p>
              <button
                onClick={resetForm}
                className="text-sm font-medium text-green-700 hover:text-green-600"
              >
                Register Another Team
              </button> 
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-xl font-bold">Register a Team</h1>
              <p className="text-blue-100 text-sm">Register teams directly with payment</p>
            </div>
            {!isLandscapeMode && <ProgressSteps />}
          </div>
          {isLandscapeMode && <ProgressSteps />}
        </div>

        <form onSubmit={handleSubmit} className={isLandscapeMode ? "p-4" : "p-5"}>
          {isLandscapeMode ? (
            // Landscape layout - all steps visible side by side
            <div className="grid grid-cols-3 gap-4">
              {/* Tournament selection */}
              <div className={`${currentStep === 1 ? 'bg-blue-50' : ''} p-3 rounded-lg`}>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                  Tournament Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Tournament*
                    </label>
                    <select
                      id="tournament"
                      value={selectedTournament}
                      onChange={(e) => setSelectedTournament(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="">-- Select Tournament --</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.title} ({new Date(tournament.startDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedTournament && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
                      <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm">
                        ₹{entryFee}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team information */}
              <div className={`${currentStep === 2 ? 'bg-blue-50' : ''} p-3 rounded-lg`}>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                  Team Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={teamData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="captainName" className="block text-sm font-medium text-gray-700 mb-1">
                      Captain Name*
                    </label>
                    <input
                      type="text"
                      id="captainName"
                      name="captainName"
                      value={teamData.captainName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      placeholder="Enter captain's name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="captainEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Captain Email*
                      </label>
                      <input
                        type="email"
                        id="captainEmail"
                        name="captainEmail"
                        value={teamData.captainEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="captainPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Captain Phone*
                      </label>
                      <input
                        type="tel"
                        id="captainPhone"
                        name="captainPhone"
                        value={teamData.captainPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Phone"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Team Members</h4>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100"
                    >
                      <FiPlus className="mr-1" size={12} /> Add
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-1">
                    {teamData.members.map((member, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded-lg mb-2 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-500">Member {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <input
                            type="text"
                            value={member.uid}
                            onChange={(e) => handleMemberChange(index, 'uid', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                            placeholder="Player UID*"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Portrait layout - step by step
            <div>
              {/* Step 1: Tournament Selection */}
              {currentStep === 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Step 1: Select Tournament
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Tournament*
                      </label>
                      <select
                        id="tournament"
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        required
                      >
                        <option value="">-- Select Tournament --</option>
                        {tournaments.map((tournament) => (
                          <option key={tournament._id} value={tournament._id}>
                            {tournament.title} ({new Date(tournament.startDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedTournament && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
                        <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm">
                          ₹{entryFee}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Team Information */}
              {currentStep === 2 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Step 2: Enter Team Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={teamData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Enter team name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="captainName" className="block text-sm font-medium text-gray-700 mb-1">
                        Captain Name*
                      </label>
                      <input
                        type="text"
                        id="captainName"
                        name="captainName"
                        value={teamData.captainName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Enter captain's name"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="captainEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Captain Email*
                        </label>
                        <input
                          type="email"
                          id="captainEmail"
                          name="captainEmail"
                          value={teamData.captainEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Email"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="captainPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          Captain Phone*
                        </label>
                        <input
                          type="tel"
                          id="captainPhone"
                          name="captainPhone"
                          value={teamData.captainPhone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Phone"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Team Members</h4>
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100"
                      >
                        <FiPlus className="mr-1" size={12} /> Add
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto pr-1">
                      {teamData.members.map((member, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg mb-2 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-500">Member {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeTeamMember(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            <input
                              type="text"
                              value={member.uid}
                              onChange={(e) => handleMemberChange(index, 'uid', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                              placeholder="Player UID*"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Step 3: Payment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selected Tournament
                      </label>
                      <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm">
                        {tournaments.find(t => t._id === selectedTournament)?.title || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entry Fee
                      </label>
                      <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm">
                        ₹{entryFee}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        disabled
                      >
                        <option value="online">Online (Credit/Debit Card, UPI)</option>
                        <option value="offline">Offline (Cash, Cheque)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium"
              disabled={currentStep === 1}
            >
              &larr; Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              {currentStep === 3 ? 'Register Team' : 'Next &rarr;'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTeam;
