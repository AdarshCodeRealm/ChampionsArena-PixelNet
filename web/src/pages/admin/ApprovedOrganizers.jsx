import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ApprovedOrganizers = () => {
  const { user } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDetailsOrganizer, setViewDetailsOrganizer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchApprovedOrganizers();
  }, []);

  const fetchApprovedOrganizers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/organizers/approved`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrganizers(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch approved organizers');
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-6 text-white">Approved Organizers</h1>
      
      {organizers.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-md text-center">
          <p className="text-blue-800">No approved organizers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left">Profile</th>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Company</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Mobile</th>
                <th className="py-3 px-4 border-b text-left">Approved On</th>
                <th className="py-3 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((organizer) => (
                <tr key={organizer._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    {organizer.profilePicture ? (
                      <img 
                        src={organizer.profilePicture} 
                        alt={organizer.name} 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40?text=" + organizer.name.charAt(0).toUpperCase();
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg text-gray-500">{organizer.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">{organizer.name}</td>
                  <td className="py-3 px-4 border-b">{organizer.companyName}</td>
                  <td className="py-3 px-4 border-b">{organizer.email}</td>
                  <td className="py-3 px-4 border-b">{organizer.mobileNumber}</td>
                  <td className="py-3 px-4 border-b">
                    {organizer.approvalDate ? new Date(organizer.approvalDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => openDetailsModal(organizer)}
                      className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && viewDetailsOrganizer && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 rounded-lg w-full max-w-3xl shadow-2xl border border-gray-700 max-h-[80vh] overflow-y-auto">
            {/* Header with close button */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              <h3 className="text-xl font-bold text-blue-400">Organizer Profile</h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Profile header */}
            <div className="flex items-center bg-gray-700 p-3 rounded-lg mb-4">
              {viewDetailsOrganizer.profilePicture ? (
                <img 
                  src={viewDetailsOrganizer.profilePicture} 
                  alt={viewDetailsOrganizer.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewDetailsOrganizer.name)}&background=0D8ABC&color=fff`;
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">{viewDetailsOrganizer.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="ml-4">
                <h4 className="text-xl font-bold text-white">{viewDetailsOrganizer.name}</h4>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <p className="text-gray-300">{viewDetailsOrganizer.companyName}</p>
                </div>
              </div>
            </div>
            
            {/* Info panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Personal Details</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{viewDetailsOrganizer.email}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{viewDetailsOrganizer.mobileNumber}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Aadhar:</span>
                    <span className="text-white">{viewDetailsOrganizer.aadharNumber}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">Approved</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Company Information</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white">{viewDetailsOrganizer.companyName}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Registration:</span>
                    <span className="text-white">{viewDetailsOrganizer.companyRegistrationNumber || "Not provided"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">UPI:</span>
                    <span className="text-white">{viewDetailsOrganizer.upiAddress || "Not provided"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Verification:</span>
                    <span className={viewDetailsOrganizer.isVerified ? "text-green-400" : "text-yellow-400"}>
                      {viewDetailsOrganizer.isVerified ? "Verified" : "Pending"}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Important Dates</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Registration:</span>
                    <span className="text-white">{new Date(viewDetailsOrganizer.createdAt).toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Approval:</span>
                    <span className="text-white">{viewDetailsOrganizer.approvalDate ? new Date(viewDetailsOrganizer.approvalDate).toLocaleDateString() : 'N/A'}</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Tournament Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-900 rounded p-2 text-center">
                    <div className="text-2xl font-bold text-white">{viewDetailsOrganizer.tournaments?.length || 0}</div>
                    <div className="text-xs text-blue-300">Total Tournaments</div>
                  </div>
                  <div className="bg-green-900 rounded p-2 text-center">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-xs text-green-300">Active Tournaments</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Aadhar image section */}
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <h4 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wider">Aadhar Card Verification</h4>
              {viewDetailsOrganizer.aadharImage ? (
                <div className="relative">
                  <img 
                    src={viewDetailsOrganizer.aadharImage} 
                    alt="Aadhar Card" 
                    className="w-full h-auto rounded border border-gray-600 object-contain max-h-48"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-600 text-xs text-white px-2 py-1 rounded">Verified</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 bg-gray-800 rounded text-gray-400">
                  <span>No Aadhar image available</span>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedOrganizers;