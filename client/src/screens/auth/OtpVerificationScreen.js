import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { colors } from '../../styles/globalStyles';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { email, userType } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const { login } = useAuth();
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input when screen loads
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Setup countdown timer for resend button
    const countdownInterval = setInterval(() => {
      setResendCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, []);

  const handleOtpChange = (value, index) => {
    // Only accept numbers
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-advance to next input if current input is filled
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Go to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.verifyOtp(email, otpValue, userType);
      
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        await login(accessToken, refreshToken, user);
        // Navigation is handled by the AppNavigator based on auth state
      } else {
        Alert.alert('Verification Failed', response.message || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Verification Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await authService.resendOtp(email, userType);
      
      if (response.success) {
        setResendCountdown(30);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
      } else {
        Alert.alert('Resend Failed', response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Resend Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resendContainer}
          onPress={handleResendOtp}
          disabled={resendCountdown > 0 || isLoading}
        >
          <Text style={styles.resendText}>
            {resendCountdown > 0 
              ? `Resend code in ${resendCountdown}s` 
              : 'Resend code'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: colors.cardBackground,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
});

export default OtpVerificationScreen; 