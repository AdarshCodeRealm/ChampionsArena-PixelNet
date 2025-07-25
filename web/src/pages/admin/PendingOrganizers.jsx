import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PendingOrganizers = () => {
  const { user } = useAuth();
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailsOrganizer, setViewDetailsOrganizer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const fetchPendingOrganizers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/organizers/pending`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setPendingOrganizers(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (organizerId) => {
    try {
      await axios.patch(
        `${API_URL}/admin/organizers/${organizerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success('Organizer approved successfully');
      fetchPendingOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve organizer');
    }
  };

  const openRejectModal = (organizer) => {
    setSelectedOrganizer(organizer);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsModalOpen(false);
    setSelectedOrganizer(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/admin/organizers/${selectedOrganizer._id}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success('Organizer rejected successfully');
      closeRejectModal();
      fetchPendingOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject organizer');
    }
  };

  const openDetailsModal = (organizer) => {
    setViewDetailsOrganizer(organizer);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewDetailsOrganizer(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="loader"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Organizers</h1>
      
      {pendingOrganizers.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-md text-center">
          <p className="text-gray-200 text-lg">No pending organizer requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Company</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Mobile</th>
                <th className="py-3 px-4 border-b text-left">Registered On</th>
                <th className="py-3 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrganizers.map((organizer) => (
                <tr key={organizer._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{organizer.name}</td>
                  <td className="py-3 px-4 border-b">{organizer.companyName}</td>
                  <td className="py-3 px-4 border-b">{organizer.email}</td>
                  <td className="py-3 px-4 border-b">{organizer.mobileNumber}</td>
                  <td className="py-3 px-4 border-b">
                    {new Date(organizer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b space-x-2">
                    <button
                      onClick={() => openDetailsModal(organizer)}
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleApprove(organizer._id)}
                      className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(organizer)}
                      className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reject Organizer</h3>
            <p className="mb-2">
              Please provide a reason for rejecting{' '}
              <span className="font-semibold">{selectedOrganizer?.name}</span>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="3"
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && viewDetailsOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Organizer Details</h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center">
                  {viewDetailsOrganizer.profilePicture ? (
                    <img 
                      src={viewDetailsOrganizer.profilePicture} 
                      alt={viewDetailsOrganizer.name} 
                      className="w-24 h-24 rounded-full object-cover mr-4" 
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="text-2xl text-gray-500">{viewDetailsOrganizer.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold">{viewDetailsOrganizer.name}</h4>
                    <p className="text-gray-600">{viewDetailsOrganizer.companyName}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-semibold">Email:</span> {viewDetailsOrganizer.email}</p>
                <p><span className="font-semibold">Mobile Number:</span> {viewDetailsOrganizer.mobileNumber}</p>
                <p><span className="font-semibold">Aadhar Number:</span> {viewDetailsOrganizer.aadharNumber}</p>
                <p><span className="font-semibold">Company Address:</span> {viewDetailsOrganizer.companyAddress}</p>
                <p><span className="font-semibold">Company Registration:</span> {viewDetailsOrganizer.companyRegistrationNumber || "Not provided"}</p>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-semibold">Registration Date:</span> {new Date(viewDetailsOrganizer.createdAt).toLocaleString()}</p>
                <p><span className="font-semibold">UPI Address:</span> {viewDetailsOrganizer.upiAddress || "Not provided"}</p>
                <p><span className="font-semibold">Email Verified:</span> {viewDetailsOrganizer.isVerified ? "Yes" : "No"}</p>
              </div>
              
              <div className="col-span-2">
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Aadhar Card Image</h4>
                  {viewDetailsOrganizer.aadharImage ? (
                    <div className="border border-gray-300 rounded-lg p-2">
                      <img 
                        src={viewDetailsOrganizer.aadharImage} 
                        alt="Aadhar Card" 
                        className="max-w-full h-auto rounded" 
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500">No Aadhar image available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeDetailsModal();
                  handleApprove(viewDetailsOrganizer._id);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve Organizer
              </button>
              <button
                onClick={() => {
                  closeDetailsModal();
                  openRejectModal(viewDetailsOrganizer);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject Organizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrganizers;