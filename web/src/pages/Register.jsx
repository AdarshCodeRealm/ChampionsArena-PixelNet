import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';
import { 
  Box, 
  Typography, 
  Button, 
  CssBaseline,
  InputBase,
  styled,
  Divider,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  IconButton,
  Drawer,
  Badge,
  Tooltip,
  FormHelperText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Create a custom theme to match the login page
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6a1f', // Orange color for the button
    },
    background: {
      default: '#002a2a', // Dark teal background from the image
      paper: '#002a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 400,
      letterSpacing: '1px',
    },
    body1: {
      letterSpacing: '0.5px',
    },
    button: {
      letterSpacing: '1px',
      fontWeight: 400,
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 0',
          fontWeight: 400,
        },
      },
    },
  },
});

// Custom styled input fields to match the design
const StyledInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  '& .MuiInputBase-input': {
    borderRadius: 0,
    backgroundColor: '#fff',
    color: '#000',
    padding: '14px 16px',
    fontSize: '16px',
    '&::placeholder': {
      color: '#999',
      opacity: 1,
    },
  },
  marginBottom: '16px',
}));

// Function to format date to readable format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    aadharNumber: '',
    aadharImage: null,
    companyName: '',
    companyAddress: '',
    paymentAddress: '',
    companyRegistrationNumber: '',
    profilePicture: null,
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [aadharImageName, setAadharImageName] = useState('');
  const [profilePictureName, setProfilePictureName] = useState('');
  
  // Sidebar state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(0);
  
  const navigate = useNavigate();
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch pending organizers and registered players data
  useEffect(() => {
    fetchPendingOrganizers();
    fetchRegisteredPlayers();
  }, []);

  // Fetch pending organizers
  const fetchPendingOrganizers = async () => {
    setLoadingOrganizers(true);
    try {
      // In a real implementation, this would be secured with admin authentication
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/v1/admin/organizers/pending`);
      setPendingOrganizers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pending organizers:", error);
      // Demo data for development
      setPendingOrganizers([
        { _id: '1', name: 'John Smith', email: 'john@example.com', companyName: 'Game Masters', createdAt: new Date().toISOString() },
        { _id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', companyName: 'E-Sports Hub', createdAt: new Date().toISOString() },
        { _id: '3', name: 'David Lee', email: 'david@example.com', companyName: 'Tournament Pro', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  // Fetch registered players
  const fetchRegisteredPlayers = async () => {
    setLoadingPlayers(true);
    try {
      // In a real implementation, this would be secured with admin authentication
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/v1/admin/players`);
      setRegisteredPlayers(response.data.data || []);
      
      // Set total players count
      setTotalPlayers(response.data.data ? response.data.data.length : 0);
    } catch (error) {
      console.error("Error fetching registered players:", error);
      // Demo data for development
      setRegisteredPlayers([
        { _id: '1', name: 'Player One', username: 'p1gamer', email: 'player1@example.com', createdAt: new Date().toISOString() },
        { _id: '2', name: 'Player Two', username: 'p2pro', email: 'player2@example.com', createdAt: new Date().toISOString() },
        { _id: '3', name: 'Player Three', username: 'p3legend', email: 'player3@example.com', createdAt: new Date().toISOString() },
        { _id: '4', name: 'Player Four', username: 'p4master', email: 'player4@example.com', createdAt: new Date().toISOString() },
        { _id: '5', name: 'Player Five', username: 'p5elite', email: 'player5@example.com', createdAt: new Date().toISOString() }
      ]);
      
      // Set demo total players count
      setTotalPlayers(5);
    } finally {
      setLoadingPlayers(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      
      // Update file name display
      if (name === 'aadharImage') {
        setAadharImageName(files[0].name);
      } else if (name === 'profilePicture') {
        setProfilePictureName(files[0].name);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate Aadhar number length
    if (formData.aadharNumber.length !== 12) {
      setError('Aadhar number must be 12 digits');
      return;
    }
    
    // Validate required files
    if (!formData.aadharImage) {
      setError('Aadhar image is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create form data object for file uploads
      const submitFormData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'aadharImage' && key !== 'profilePicture' && key !== 'confirmPassword') {
          submitFormData.append(key, formData[key]);
        }
      });
      
      // Add files
      if (formData.aadharImage) {
        submitFormData.append('aadharImage', formData.aadharImage);
      }
      
      if (formData.profilePicture) {
        submitFormData.append('profilePicture', formData.profilePicture);
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/organizer-auth/register`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setSuccess('Registration successful! Your application is pending approval.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          minHeight: '100vh',
          flexDirection: isMobile ? 'column' : 'row',
          backgroundColor: '#002a2a', // Dark teal background
        }}
      >
        {/* Logo section - full width on mobile, half width on desktop */}
        <Box 
          sx={{ 
            flex: isMobile ? 'unset' : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isMobile ? 3 : 4,
          }}
        >
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={logo} 
              alt="Champions Arena Logo" 
              style={{ 
                width: isMobile ? '90px' : '120px',
                height: 'auto',
                marginBottom: '20px',
              }}
            />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 400, 
                letterSpacing: '1px',
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              Champions Arena
            </Typography>
          </Box>
        </Box>

        {/* Divider - horizontal on mobile, vertical on desktop */}
        {isMobile ? 
          <Divider flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 3 }} /> :
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        }
        
        {/* Registration form section - full width on mobile, half width on desktop */}
        <Box 
          sx={{ 
            flex: isMobile ? 'unset' : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isMobile ? 3 : 4,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Admin panel toggle button */}
          <Tooltip title="Admin Panel">
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255, 106, 31, 0.7)',
                color: '#fff',
                '&:hover': { bgcolor: '#ff6a1f' },
              }}
            >
              <Badge badgeContent={pendingOrganizers.length} color="error">
                <AdminPanelSettingsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ width: '100%', maxWidth: '500px' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 1,
                fontWeight: 300,
                letterSpacing: '2px',
                fontSize: isMobile ? '2rem' : '2.5rem',
              }}
            >
              Register
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)', 
              }}
            >
              Create an Organizer account
            </Typography>
            
            {error && (
              <Box 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  bgcolor: 'rgba(255, 0, 0, 0.1)', 
                  borderRadius: 1,
                  color: '#ff6b6b'
                }}
              >
                {error}
              </Box>
            )}
            
            {success && (
              <Box 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  bgcolor: 'rgba(75, 181, 67, 0.1)', 
                  borderRadius: 1,
                  color: '#4bb543'
                }}
              >
                {success}
              </Box>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                Personal Information
              </Typography>
              
              <StyledInput 
                placeholder="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Email *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Mobile Number *"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                fullWidth
              />

              <StyledInput 
                placeholder="Aadhar Number (12 digits) *"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                inputProps={{ maxLength: 12, minLength: 12 }}
                required
                fullWidth
              />

              <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{ 
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Upload Aadhar Image *
                  <input
                    type="file"
                    name="aadharImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                    required
                  />
                </Button>
                <Typography 
                  variant="body2" 
                  sx={{ ml: 2, color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {aadharImageName || 'No file selected'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{ 
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Upload Profile Picture
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                <Typography 
                  variant="body2" 
                  sx={{ ml: 2, color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {profilePictureName || 'No file selected'}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                Company Information
              </Typography>
              
              <StyledInput 
                placeholder="Company Name *"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Company Address *"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Payment Address (UPI ID) *"
                name="paymentAddress"
                value={formData.paymentAddress}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Company Registration Number"
                name="companyRegistrationNumber"
                value={formData.companyRegistrationNumber}
                onChange={handleChange}
                fullWidth
              />

              <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                Security
              </Typography>
              
              <StyledInput 
                placeholder="Password *"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <StyledInput 
                placeholder="Confirm Password *"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
              />
              
              <Box sx={{ mt: 4, mb: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                  }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link 
                  to="/"
                  style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  Already have an account? Login here
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Sidebar - Admin only section for pending organizers and registered players */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: '#002a2a',
              color: '#fff',
              width: '300px',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: '1px' }}>
              Admin Panel
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Pending Organizers Section */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Pending Organizers
            </Typography>
            
            {loadingOrganizers ? (
              <CircularProgress size={24} sx={{ color: '#ff6a1f' }} />
            ) : (
              <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                {pendingOrganizers.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 2 }}>
                    No pending organizers
                  </Typography>
                ) : (
                  pendingOrganizers.map((organizer) => (
                    <ListItem key={organizer._id} sx={{ py: 1, px: 2, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff6a1f' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={organizer.name} 
                        secondary={organizer.email} 
                        primaryTypographyProps={{ 
                          fontWeight: 500, 
                          color: '#fff',
                          noWrap: true,
                        }}
                        secondaryTypographyProps={{ 
                          color: 'rgba(255,255,255,0.7)',
                          noWrap: true,
                        }}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Box>
          
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
          
          {/* Registered Players Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Registered Players
              </Typography>
              <Box sx={{ 
                bgcolor: 'rgba(255,106,31,0.2)', 
                px: 2, 
                py: 0.5, 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff6a1f' }}>
                  Total: {totalPlayers}
                </Typography>
              </Box>
            </Box>
            
            {loadingPlayers ? (
              <CircularProgress size={24} sx={{ color: '#ff6a1f' }} />
            ) : (
              <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                {registeredPlayers.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 2 }}>
                    No registered players
                  </Typography>
                ) : (
                  registeredPlayers.map((player) => (
                    <ListItem key={player._id} sx={{ py: 1, px: 2, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff6a1f' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={player.name} 
                        secondary={player.email} 
                        primaryTypographyProps={{ 
                          fontWeight: 500, 
                          color: '#fff',
                          noWrap: true,
                        }}
                        secondaryTypographyProps={{ 
                          color: 'rgba(255,255,255,0.7)',
                          noWrap: true,
                        }}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Register;