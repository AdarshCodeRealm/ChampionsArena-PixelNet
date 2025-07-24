import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.jpg';
import OtpVerification from '../components/OtpVerification';
import { 
  Box, 
  Typography, 
  Button, 
  CssBaseline,
  InputBase,
  styled,
  Divider,
  useMediaQuery,
  ButtonGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a custom theme to match the design
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

const Login = () => {
  const [userType, setUserType] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  
  const { loginAdmin, initiateOrganizerLogin, completeOrganizerLogin, requestLoginOTP, pendingLoginEmail } = useAuth();
  const navigate = useNavigate();
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  useEffect(() => {
    const adminSaved = localStorage.getItem('rememberMeLoginAdmin');
    const organizerSaved = localStorage.getItem('rememberMeLoginOrganizer');
    if (userType === 'admin' && adminSaved) {
      const { email, password } = JSON.parse(adminSaved);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    } else if (userType === 'organizer' && organizerSaved) {
      const { email, password } = JSON.parse(organizerSaved);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    } else {
      setEmail('');
      setPassword('');
      setRememberMe(false);
    }
  }, [userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (userType === 'admin') {
        if (rememberMe) {
          localStorage.setItem('rememberMeLoginAdmin', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('rememberMeLoginAdmin');
        }
        await loginAdmin(email, password);
        navigate('/admin');
      } else {
        // For organizer, we need to handle 2FA
        if (rememberMe) {
          localStorage.setItem('rememberMeLoginOrganizer', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('rememberMeLoginOrganizer');
        }
        
        const response = await initiateOrganizerLogin(email, password);
        // If we get here, OTP was sent successfully
        setShowOtpVerification(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpVerify = async (otp) => {
    setError('');
    setLoading(true);
    
    try {
      await completeOrganizerLogin(email, password, otp);
      navigate('/organizer');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    
    try {
      await requestLoginOTP(email);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
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
          backgroundColor: '#002a2a', // Dark teal background from the image
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
        
        {/* Login form section - full width on mobile, half width on desktop */}
        <Box 
          sx={{ 
            flex: isMobile ? 'unset' : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isMobile ? 3 : 4,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            {!showOtpVerification ? (
              // Regular login form
              <>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 1,
                    fontWeight: 300,
                    letterSpacing: '2px',
                    fontSize: isMobile ? '2rem' : '2.5rem',
                  }}
                >
                  Welcome
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 3,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)', 
                  }}
                >
                  Please select your account type
                </Typography>
                
                {/* Admin/Organizer selection buttons */}
                <Box sx={{ mb: 4 }}>
                  <ButtonGroup 
                    fullWidth 
                    variant="contained" 
                    sx={{ backgroundColor: '#ff6a1f' }}
                  >
                    <Button 
                      onClick={() => setUserType('admin')}
                      sx={{ 
                        py: 1.2,
                        backgroundColor: userType === 'admin' ? '#ff6a1f' : 'transparent',
                        color: userType === 'admin' ? 'white' : 'rgba(255,255,255,0.7)',
                        border: userType === 'admin' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        borderRight: userType === 'admin' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          backgroundColor: userType === 'admin' ? '#ff6a1f' : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Admin
                    </Button>
                    <Button 
                      onClick={() => setUserType('organizer')}
                      sx={{ 
                        py: 1.2,
                        backgroundColor: userType === 'organizer' ? '#ff6a1f' : 'transparent',
                        color: userType === 'organizer' ? 'white' : 'rgba(255,255,255,0.7)',
                        border: userType === 'organizer' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        borderLeft: userType === 'organizer' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          backgroundColor: userType === 'organizer' ? '#ff6a1f' : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Organizer
                    </Button>
                  </ButtonGroup>
                </Box>
                
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
                
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <StyledInput 
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                  />
                  
                  <StyledInput 
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{color: 'rgba(255,255,255,0.7)', '&.Mui-checked': {color: '#ff6a1f'}}} />}
                    label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Remember Me</Typography>}
                    sx={{ mb: 0, ml: 0, justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}
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
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Link 
                      to="/forgot-password"
                      style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                      }}
                    >
                      Forgotten Your Password?
                    </Link>
                  
                    {userType === 'organizer' && (
                      <Box sx={{ mt: 2 }}>
                        <Link 
                          to="/register"
                          style={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                          }}
                        >
                          New organizer? Register here
                        </Link>
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              // OTP verification form
              <>
                <OtpVerification 
                  email={email} 
                  onVerify={handleOtpVerify}
                  onResend={handleResendOtp}
                  loading={loading}
                />
                
                {error && (
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: 'rgba(255, 0, 0, 0.1)', 
                      borderRadius: 1,
                      color: '#ff6b6b'
                    }}
                  >
                    {error}
                  </Box>
                )}
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="text"
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      textTransform: 'none'
                    }}
                    onClick={() => setShowOtpVerification(false)}
                  >
                    Back to Login
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;