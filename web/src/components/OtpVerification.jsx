import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  styled,
  InputBase
} from '@mui/material';

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

const OtpVerification = ({ email, onVerify, onResend, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [error, setError] = useState('');
  const otpInputRefs = useRef([]);
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate OTP
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    onVerify(otpValue);
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 2,
          fontWeight: 400,
          textAlign: 'center'
        }}
      >
        Two-Factor Authentication
      </Typography>
      
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
      
      <Box component="form" onSubmit={handleSubmit}>
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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Login'}
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="text"
            color="primary"
            onClick={onResend}
            disabled={loading}
            sx={{ textTransform: 'none', fontSize: '0.9rem' }}
          >
            Didn't receive code? Send again
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OtpVerification;