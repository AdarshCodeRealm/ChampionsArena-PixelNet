import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.jpg';
import {
  Box,
  Typography,
  Button,
  CssBaseline,
  InputBase,
  styled,
  CircularProgress,
  useMediaQuery,
  IconButton,
  InputAdornment
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Create a custom theme to match the design
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6a1f', // Orange color for the button
    },
    background: {
      default: '#002a2a', // Dark teal background
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

// Custom styled input fields
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

// OTP input styling
const OtpInput = styled(InputBase)(({ theme }) => ({
  width: '48px',
  height: '48px',
  margin: '0 4px',
  '& .MuiInputBase-input': {
    borderRadius: 0,
    backgroundColor: '#fff',
    color: '#000',
    padding: '4px',
    fontSize: '20px',
    textAlign: 'center',
    caretColor: 'transparent',
    '&::placeholder': {
      color: '#999',
      opacity: 1,
    },
  },
}));

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP and new password
  
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { forgotPassword, resetPassword: resetPasswordWithOTP } = useAuth();
  
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      otpInputRefs.current[index - 1].focus();
    }
  };
  
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setMessage('OTP has been sent to your email. Please check your inbox.');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    // Validate password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Validate OTP
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      await resetPasswordWithOTP(email, otpValue, password);
      setMessage('Password has been reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#002a2a',
          p: 3
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img 
            src={logo} 
            alt="Champions Arena Logo" 
            style={{ 
              width: '90px',
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
              fontSize: '2rem',
            }}
          >
            Champions Arena
          </Typography>
        </Box>
        
        {/* Form Card */}
        <Box 
          sx={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'rgba(0,0,0,0.4)',
            p: 4,
            borderRadius: '4px',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2,
              fontWeight: 400,
              textAlign: 'center'
            }}
          >
            Reset Password
          </Typography>
          
          {message && (
            <Box 
              sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: 'rgba(0, 255, 0, 0.1)', 
                borderRadius: 1,
                color: '#8eff8e'
              }}
            >
              {message}
            </Box>
          )}
          
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
          
          {step === 1 ? (
            // Step 1: Enter email to request OTP
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              >
                Enter your email address to receive a verification code.
              </Typography>
              
              <Box component="form" onSubmit={handleRequestOTP}>
                <StyledInput 
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    mt: 2
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Request Verification Code'}
                </Button>
              </Box>
            </>
          ) : (
            // Step 2: Enter OTP and new password
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              >
                Enter the 6-digit verification code sent to:
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                {email}
              </Typography>
              
              <Box component="form" onSubmit={handleResetPassword}>
                {/* OTP Input */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  {otp.map((digit, index) => (
                    <OtpInput
                      key={index}
                      inputRef={(ref) => (otpInputRefs.current[index] = ref)}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      maxLength={1}
                      inputProps={{ maxLength: 1, inputMode: 'numeric', pattern: '[0-9]' }}
                    />
                  ))}
                </Box>
                
                {/* New Password */}
                <StyledInput 
                  placeholder="New Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#555' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                
                {/* Confirm Password */}
                <StyledInput 
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#555' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    mt: 2
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleRequestOTP}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontSize: '0.9rem' }}
                  >
                    Didn't receive code? Send again
                  </Button>
                </Box>
              </Box>
            </>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link 
              to="/login"
              style={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ResetPassword;