import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const DEFAULT_RULES = {
  fullMap: `Full Map Rules:\n- All players must join the lobby on time.\n- No use of hacks or third-party software.\n- Teaming with other squads is not allowed.\n- The use of glitches or exploits is prohibited.\n- The decision of the organizer is final.`,
  clashSquad: `Clash Squad Rules:\n- Each match consists of 7 rounds.\n- No use of hacks or third-party software.\n- Teaming with other squads is not allowed.\n- The use of glitches or exploits is prohibited.\n- The decision of the organizer is final.`
};

const OrganizerCreateTournament = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    maxTeams: '',
    game: '',
    entryFee: '',
    prizePool: '',
    rules: '',
    platform: 'Mobile',
    region: 'India',
    rulesType: '',
    teamSize: 'squad',
    customTeamSize: '',
    tournamentFormat: 'single-elimination',
  });
  const [bannerImage, setBannerImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If teamSize changes, reset customTeamSize
    if (name === 'teamSize') {
      setFormData({
        ...formData,
        teamSize: value,
        customTeamSize: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleRulesTypeChange = (e) => {
    const type = e.target.value;
    setFormData({
      ...formData,
      rulesType: type,
      rules: DEFAULT_RULES[type] || ''
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'bannerImage' && e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation for all required fields
    const requiredFields = ['title', 'description', 'game', 'startDate', 'startTime', 'maxTeams', 'platform', 'region', 'teamSize'];
    for (const field of requiredFields) {
      if (!formData[field] || (field === 'customTeamSize' && formData.teamSize === 'other' && !formData.customTeamSize)) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      // Create a new FormData object
      const submitData = new FormData();
      
      // Add all required fields explicitly
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('game', formData.game);
      submitData.append('region', formData.region);
      submitData.append('platform', formData.platform);
      submitData.append('maxTeams', formData.maxTeams);
      submitData.append('startDate', formData.startDate);
      submitData.append('startTime', formData.startTime);
      submitData.append('teamSize', formData.teamSize);
      
      // Add optional fields
      if (formData.entryFee !== '') {
        submitData.append('entryFee', Number(formData.entryFee));
      }
      
      if (formData.prizePool !== '') {
        submitData.append('prizePool', Number(formData.prizePool));
      }
      
      if (formData.rules) {
        submitData.append('rules', formData.rules);
      }
      
      if (formData.tournamentFormat) {
        submitData.append('tournamentFormat', formData.tournamentFormat);
      }
      
      // Add customTeamSize if needed
      if (formData.teamSize === 'other' && formData.customTeamSize) {
        submitData.append('customTeamSize', formData.customTeamSize);
      }
      
      // Add banner image if provided
      if (bannerImage) {
        submitData.append('bannerImage', bannerImage);
      }
      
      // Debug the form data
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}: ${value}`); 
      }

      // Send the request
      const response = await axios.post(`${API_URL}/tournaments`, submitData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Tournament created successfully');
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        maxTeams: '',
        game: '',
        entryFee: '',
        prizePool: '',
        rules: '',
        platform: 'Mobile',
        region: 'India',
        rulesType: '',
        teamSize: 'squad',
        customTeamSize: '',
        tournamentFormat: 'single-elimination',
      });
      setBannerImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Tournament</h2>
        <p className="text-gray-600">Fill in the details to create a new tournament</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tournament title" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game*</label>
            <input type="text" name="game" value={formData.game} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter game name" required />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee (₹)</label>
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
            <select name="region" value={formData.region} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="India">India</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Size*</label>
            <select name="teamSize" value={formData.teamSize} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
              <option value="other">Other</option>
            </select>
          </div>
          {formData.teamSize === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Team Size*</label>
              <input type="number" name="customTeamSize" value={formData.customTeamSize} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter custom team size" min="1" max="100" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Format*</label>
            <select name="tournamentFormat" value={formData.tournamentFormat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <input type="file" name="bannerImage" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tournament description" rows="3" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rules Type</label>
          <div className="flex gap-6 mb-2">
            <label className="flex items-center">
              <input type="radio" name="rulesType" value="fullMap" checked={formData.rulesType === 'fullMap'} onChange={handleRulesTypeChange} className="mr-2" />
              Full Map
            </label>
            <label className="flex items-center">
              <input type="radio" name="rulesType" value="clashSquad" checked={formData.rulesType === 'clashSquad'} onChange={handleRulesTypeChange} className="mr-2" />
              Clash Squad
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
          <textarea name="rules" value={formData.rules} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tournament rules" rows="5" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}>{loading ? 'Creating...' : 'Create Tournament'}</button>
        </div>
      </form>
    </div>
  );
};

export default OrganizerCreateTournament;