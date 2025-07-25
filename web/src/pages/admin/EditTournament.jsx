import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const EditTournament = () => {
  const { tournamentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    startDate: '',
    startTime: '',
    maxTeams: '',
    teamSize: 'squad',
    platform: 'Mobile',
    region: 'India',
    entryFee: '',
    prizePool: '',
    rules: '',
    status: 'draft'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    // Verify admin authentication
    if (!user || !user.token) {
      toast.error('You need to be logged in to access this page');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      toast.error('You are not authorized to access this page');
      navigate('/login');
      return;
    }
    
    fetchTournamentDetails();
  }, [tournamentId, user, navigate]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/tournaments/${tournamentId}?populate=organizer`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        const tournamentData = response.data.data;
        setTournament(tournamentData);
        
        // Format date for input field (YYYY-MM-DD)
        let startDateFormatted = '';
        if (tournamentData.startDate) {
          const date = new Date(tournamentData.startDate);
          startDateFormatted = date.toISOString().split('T')[0];
        }
        
        // Extract time from startDate (HH:MM)
        let startTimeFormatted = '';
        if (tournamentData.startDate) {
          const date = new Date(tournamentData.startDate);
          startTimeFormatted = date.toTimeString().substring(0, 5);
        }
        
        setFormData({
          title: tournamentData.title || '',
          description: tournamentData.description || '',
          game: tournamentData.game || '',
          startDate: startDateFormatted,
          startTime: tournamentData.startTime || startTimeFormatted || '12:00',
          maxTeams: tournamentData.maxTeams || '',
          teamSize: tournamentData.teamSize || 'squad',
          platform: tournamentData.platform || 'Mobile',
          region: tournamentData.region || 'India',
          entryFee: tournamentData.entryFee || '',
          prizePool: tournamentData.prizePool || '',
          rules: tournamentData.rules || '',
          status: tournamentData.status || 'draft'
        });
      } else {
        toast.error('Failed to fetch tournament details');
      }
    } catch (err) {
      console.error('Error fetching tournament details:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ['title', 'game', 'startDate', 'startTime', 'maxTeams', 'platform', 'region', 'teamSize'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return;
      }
    }
    
    try {
      setSaving(true);
      
      // Prepare tournament data
      const tournamentData = {
        ...formData,
        maxTeams: Number(formData.maxTeams),
        entryFee: formData.entryFee ? Number(formData.entryFee) : 0,
        prizePool: formData.prizePool ? Number(formData.prizePool) : 0
      };
      
      // Make API call
      const response = await axios.put(
        `${API_URL}/tournaments/admin/${tournamentId}`, 
        tournamentData, 
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Tournament updated successfully');
        navigate(`/admin/tournaments/${tournamentId}`);
      } else {
        toast.error('Failed to update tournament');
      }
    } catch (err) {
      console.error('Error updating tournament:', err);
      toast.error(err.response?.data?.message || 'Failed to update tournament');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to={`/admin/tournaments/${tournamentId}`}
            className="mr-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
          >
            <FiArrowLeft className="text-gray-700" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Edit Tournament</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game*</label>
            <input type="text" name="game" value={formData.game} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time*</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Teams*</label>
            <input type="number" name="maxTeams" value={formData.maxTeams} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter maximum number of teams" min="2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Size*</label>
            <select name="teamSize" value={formData.teamSize} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="trio">Trio</option>
              <option value="squad">Squad (4 players)</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
            <input type="number" name="entryFee" value={formData.entryFee} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter entry fee amount" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool</label>
            <input type="number" name="prizePool" value={formData.prizePool} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter prize pool amount" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform*</label>
            <select name="platform" value={formData.platform} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="Mobile">Mobile</option>
              <option value="PC">PC</option>
              <option value="Console">Console</option>
              <option value="Cross-platform">Cross-platform</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region*</label>
            <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tournament description" rows="3" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
          <textarea name="rules" value={formData.rules} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tournament rules" rows="3" />
        </div>
        
        <div className="flex justify-end">
          <Link 
            to={`/admin/tournaments/${tournamentId}`}
            className="px-6 py-2 mr-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            <FiSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTournament;