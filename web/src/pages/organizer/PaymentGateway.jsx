import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:8000/api/v1';

const PaymentGateway = () => {
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState({
    name: '',
    mobileNumber: '',
    amount: '',
    paymentMethod: 'upi'
  });
  const [loading, setLoading] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState({ active: false, message: 'Checking...' });

  // Check payment gateway status on component mount
  useEffect(() => {
    const checkGatewayStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/payments/status`);
        if (response.data.success) {
          setGatewayStatus({ 
            active: true, 
            message: `${response.data.data.provider} gateway is active` 
          });
        } else {
          setGatewayStatus({ active: false, message: 'Payment gateway is currently offline' });
        }
      } catch (error) {
        console.error('Error checking payment gateway status:', error);
        setGatewayStatus({ active: false, message: 'Unable to connect to payment gateway' });
      }
    };
    
    checkGatewayStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Initiating payment with data:', paymentData);
      
      // Ensure amount is a number
      const paymentRequest = {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      };
      
      // Make API call to PhonePe payment gateway
      const response = await axios.post(
        `${API_URL}/payments/phonepe/initiate`, 
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': user?.token ? `Bearer ${user.token}` : ''
          }
        }
      );

      console.log('Payment API response:', response.data);

      // If successful, redirect to PhonePe payment page
      if (response.data && response.data.success) {
        toast.success('Redirecting to payment gateway...');
        
        // Store transaction ID in localStorage for later reference
        localStorage.setItem('currentPaymentTxnId', response.data.data.transactionId);
        
        // Redirect to PhonePe payment page
        window.location.href = response.data.data.paymentUrl;
      } else {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Extract the most useful error message
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.response) {
        // The server responded with an error status
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && typeof error.response.data === 'string') {
          // Try to extract error message if it's in HTML format (common in express errors)
          const match = error.response.data.match(/<pre>(.*?)<\/pre>/s);
          if (match && match[1]) {
            errorMessage = match[1].trim();
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <h1 className="text-white text-2xl font-bold">Payment Gateway</h1>
          <p className="text-blue-100 mt-2">Process payments for tournament registrations</p>
        </div>
        
        {/* Gateway Status Indicator */}
        <div className={`px-6 py-3 border-b ${gatewayStatus.active ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${gatewayStatus.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className={`text-sm ${gatewayStatus.active ? 'text-green-700' : 'text-red-700'}`}>
              {gatewayStatus.message}
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Participant/Team Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={paymentData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter name"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={paymentData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter mobile number"
                required
                pattern="[0-9]{10}"
              />
              <p className="text-xs text-gray-500 mt-1">10-digit mobile number without country code</p>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={paymentData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                min="1"
                step="1"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="upi"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentData.paymentMethod === 'upi'}
                    value="upi"
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                    UPI (PhonePe/Google Pay/Paytm)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="card"
                    name="paymentMethod"
                    type="radio"
                    value="card"
                    checked={paymentData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={true}
                  />
                  <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700 opacity-50">
                    Credit/Debit Card (Coming Soon)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="netbanking"
                    name="paymentMethod"
                    type="radio"
                    value="netbanking"
                    checked={paymentData.paymentMethod === 'netbanking'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={true}
                  />
                  <label htmlFor="netbanking" className="ml-3 block text-sm font-medium text-gray-700 opacity-50">
                    Net Banking (Coming Soon)
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !gatewayStatus.active}
                className={`w-full py-3 px-4 bg-gradient-to-r ${loading || !gatewayStatus.active ? 'from-gray-500 to-gray-600' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white rounded-md font-medium shadow-md transition-all duration-200 flex items-center justify-center ${(loading || !gatewayStatus.active) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : !gatewayStatus.active ? (
                  'Payment Gateway Unavailable'
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pay with PhonePe
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                All transactions are secure and encrypted. Payment information is processed via PhonePe's secure payment gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* PhonePe Integration Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <h3 className="font-medium text-gray-800">About PhonePe Test Integration</h3>
        <p className="mt-1 text-sm text-gray-600">
          This is a test integration using PhonePe's sandbox environment. No real transactions will occur.
          For testing, you can use any valid 10-digit mobile number and complete the payment flow.
        </p>
      </div>
      
      {/* Debugging Section for Development Only */}
      {import.meta.env.DEV && (
        <div className="mt-6 bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <h3 className="font-medium text-gray-800">Debug Information</h3>
          <p className="text-sm text-gray-600 mb-2">API URL: {API_URL}/payments/phonepe/initiate</p>
          <p className="text-sm text-gray-600 mb-2">User authenticated: {user ? 'Yes' : 'No'}</p>
          <p className="text-sm text-gray-600">Payment data:</p>
          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
            {JSON.stringify(paymentData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;