import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const RegisterTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [teamData, setTeamData] = useState({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    members: [{ name: '', email: '', phone: '' }]
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchTournaments();
    
    // Check for registration success message from payment process
    const successMessage = sessionStorage.getItem('teamRegistrationSuccess');
    if (successMessage) {
      toast.success(successMessage);
      setRegistrationSuccess(true);
      // Clear the success message from session storage
      sessionStorage.removeItem('teamRegistrationSuccess');
    }
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const selected = tournaments.find(t => t._id === selectedTournament);
      if (selected) {
        setEntryFee(selected.entryFee || 0);
      }
    }
  }, [selectedTournament, tournaments]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tournaments/organizer/tournaments`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setTournaments(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedTournament(response.data.data[0]._id);
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
      members: [...teamData.members, { name: '', email: '', phone: '' }]
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
      members: [{ name: '', email: '', phone: '' }]
    });
    setRegistrationSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input fields
      if (!teamData.name || !teamData.captainName || !teamData.captainEmail || !teamData.captainPhone) {
        throw new Error('Please fill all required fields');
      }
      
      if (teamData.members.some(member => !member.name || !member.email)) {
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
        members: teamData.members.filter(member => member.name && member.email)
      };
      
      localStorage.setItem('pendingTeamRegistration', JSON.stringify(teamDataForStorage));

      // Start payment process directly using the payment gateway
      const paymentData = {
        name: teamData.captainName,
        mobileNumber: teamData.captainPhone,
        amount: entryFee,
        description: `Registration fee for team ${teamData.name}`
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Message Banner */}
      {registrationSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
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
              <div className="mt-4">
                <button
                  onClick={resetForm}
                  className="text-sm font-medium text-green-700 hover:text-green-600"
                >
                  Register Another Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <h1 className="text-white text-2xl font-bold">Register a Team</h1>
          <p className="text-blue-100 mt-2">Register teams directly with payment</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tournament Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tournament*
                </label>
                <select
                  id="tournament"
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
                  <div className="px-4 py-2 border border-gray-300 bg-gray-50 rounded-md">
                    ₹{entryFee}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Information</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={teamData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter team name"
                required
              />
            </div>
          </div>

          {/* Captain Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Captain Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="captainName" className="block text-sm font-medium text-gray-700 mb-2">
                  Captain Name*
                </label>
                <input
                  type="text"
                  id="captainName"
                  name="captainName"
                  value={teamData.captainName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter captain's name"
                  required
                />
              </div>
              <div>
                <label htmlFor="captainEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Captain Email*
                </label>
                <input
                  type="email"
                  id="captainEmail"
                  name="captainEmail"
                  value={teamData.captainEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter captain's email"
                  required
                />
              </div>
              <div>
                <label htmlFor="captainPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Captain Phone*
                </label>
                <input
                  type="tel"
                  id="captainPhone"
                  name="captainPhone"
                  value={teamData.captainPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100"
              >
                <FiPlus className="mr-1" /> Add Member
              </button>
            </div>
            
            {teamData.members.map((member, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">Member {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone (optional)"
                      pattern="[0-9]{10}"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Payment Method:</strong> PhonePe/UPI Payment Gateway
              </p>
              <p className="text-sm text-blue-700 mt-1">
                You'll be directed to the payment gateway after submitting this form. 
                The team will only be registered after successful payment.
              </p>
              {entryFee > 0 && (
                <p className="text-sm font-bold text-blue-800 mt-2">
                  Amount to be paid: ₹{entryFee}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading || registrationSuccess}
              className={`py-3 px-8 ${loading || registrationSuccess ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-medium shadow-md transition-all duration-200 flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : registrationSuccess ? (
                'Registration Complete'
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTeam;