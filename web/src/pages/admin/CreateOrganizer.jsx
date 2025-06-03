import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiUpload } from 'react-icons/fi';

const CreateOrganizer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    aadharNumber: '',
    companyName: '',
    companyAddress: '',
    paymentAddress: '',
    companyRegistrationNumber: '',
  });
  
  const [aadharImage, setAadharImage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'aadharImage') {
        setAadharImage(files[0]);
      } else if (name === 'profilePicture') {
        setProfilePicture(files[0]);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (
      !formData.name || 
      !formData.email || 
      !formData.password || 
      !formData.mobileNumber ||
      !formData.aadharNumber ||
      !formData.companyName ||
      !formData.companyAddress ||
      !formData.paymentAddress ||
      !aadharImage
    ) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate Aadhar number length
    if (formData.aadharNumber.length !== 12) {
      toast.error('Aadhar number must be 12 digits');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add files
      if (aadharImage) {
        submitData.append('aadharImage', aadharImage);
      }
      
      if (profilePicture) {
        submitData.append('profilePicture', profilePicture);
      }
      
      // Make API call
      const response = await axios.post(
        `${API_URL}/admin/organizers/create`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Organizer created successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        aadharNumber: '',
        companyName: '',
        companyAddress: '',
        paymentAddress: '',
        companyRegistrationNumber: '',
      });
      setAadharImage(null);
      setProfilePicture(null);
      
    } catch (error) {
      console.error('Error creating organizer:', error);
      toast.error(error.response?.data?.message || 'Failed to create organizer');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Organizer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizer's name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizer's email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number*
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Number (12 digits)*
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 12 digit Aadhar number"
                maxLength={12}
                minLength={12}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Image*
              </label>
              <div className="flex items-center space-x-2">
                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer border hover:bg-gray-200 flex items-center">
                  <FiUpload className="mr-2" />
                  {aadharImage ? 'Change File' : 'Upload File'}
                  <input 
                    type="file" 
                    name="aadharImage" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                    required
                  />
                </label>
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {aadharImage ? aadharImage.name : 'No file selected'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer border hover:bg-gray-200 flex items-center">
                  <FiUpload className="mr-2" />
                  {profilePicture ? 'Change File' : 'Upload File'}
                  <input 
                    type="file" 
                    name="profilePicture" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {profilePicture ? profilePicture.name : 'No file selected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name*
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Registration Number (Optional)
              </label>
              <input
                type="text"
                name="companyRegistrationNumber"
                value={formData.companyRegistrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter registration number"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address*
              </label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company address"
                rows="2"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Address (UPI ID)*
              </label>
              <textarea
                name="paymentAddress"
                value={formData.paymentAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter UPI ID for payments"
                rows="2"
                required
              />
            </div>
          </div>
        </div>

        {/* Security Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password*
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Organizer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganizer;