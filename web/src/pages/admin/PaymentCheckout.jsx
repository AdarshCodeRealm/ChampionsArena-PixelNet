import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentCheckout = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.mobileNumber || !formData.amount) {
      toast.error('Please fill all fields');
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }

    if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    try {
      // Using the PhonePe initiate endpoint from your API
      const response = await axios.post(
        'http://localhost:8000/api/v1/payments/phonepe/initiate', 
        {
          name: formData.name,
          mobileNumber: formData.mobileNumber,
          amount: Number(formData.amount)
        },
        {
          withCredentials: true // Needed if you're using HttpOnly cookies for auth
        }
      );
      
      console.log('Payment initiated:', response.data);
      
      if (response.data?.data?.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error('Failed to generate payment URL');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Payment Checkout</h1>
      
      <form onSubmit={handlePayment}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="mobileNumber" className="block text-gray-700 font-medium mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10-digit mobile number"
            maxLength={10}
            pattern="\d{10}"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
            Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            min="1"
            step="1"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now with PhonePe'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Secure payments powered by PhonePe</p>
      </div>
    </div>
  );
};

export default PaymentCheckout;