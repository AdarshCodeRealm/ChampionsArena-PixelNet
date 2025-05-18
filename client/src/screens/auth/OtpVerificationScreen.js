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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { email, flowType = 'login', title = 'Verify OTP' } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { verifyOtp, resendOtp, resetPassword, authError } = useAuth();
  
  const inputRefs = useRef([]);
  const isPasswordReset = flowType === 'passwordReset';

  useEffect(() => {
    // Check if we have required data
    if (!email) {
      Alert.alert('Error', 'Email is required for verification', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    
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
  }, [email, navigation]);

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

  const validatePassword = () => {
    if (isPasswordReset) {
      if (!newPassword) {
        Alert.alert('Missing Information', 'Please enter a new password');
        return false;
      }
      
      if (newPassword.length < 8) {
        Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isPasswordReset) {
        // Handle password reset flow
        const response = await resetPassword(email, otpValue, newPassword);
        
        if (response.success) {
          Alert.alert('Success', 'Your password has been reset successfully', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        } else {
          Alert.alert('Reset Failed', response.message || 'Failed to reset password. Please try again.');
        }
      } else {
        // Handle OTP verification flow (login/registration)
        const response = await verifyOtp(email, otpValue, true);
        
        if (response.success) {
          // Authentication handled by AuthContext
          console.log("OTP verification successful");
          // After successful verification, AuthContext will update userToken
          // which will automatically trigger navigation to Main through AppNavigator
        } else {
          Alert.alert('Verification Failed', response.message || 'Failed to verify OTP. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', authError || error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await resendOtp(email);
      
      if (response.success) {
        setResendCountdown(30);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
      } else {
        Alert.alert('Resend Failed', response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Resend Error', authError || error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.backgroundGradient}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.overlay}>
            <View style={styles.content}>
              <Ionicons 
                name={isPasswordReset ? "key" : "lock-closed"} 
                size={60} 
                color={colors.primary} 
                style={styles.icon} 
              />
              
              <Text style={styles.title}>{title}</Text>
              
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.email}>{email}</Text>
              
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={18} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.infoText}>
                  {flowType === 'registration' 
                    ? "We've sent a verification code to complete your registration"
                    : isPasswordReset
                      ? "Enter the verification code to reset your password"
                      : "Enter the verification code to access your account"}
                </Text>
              </View>
              
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
              
              {isPasswordReset && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor={colors.text.placeholder}
                        secureTextEntry={!showNewPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordVisibilityButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-off" : "eye"}
                          size={24}
                          color="rgba(255, 255, 255, 0.7)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={colors.text.placeholder}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordVisibilityButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off" : "eye"}
                          size={24}
                          color="rgba(255, 255, 255, 0.7)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isPasswordReset ? 'Reset Password' : 'Verify & Continue'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendContainer}
                onPress={handleResendOtp}
                disabled={resendCountdown > 0 || isLoading}
              >
                <Text style={[styles.resendText, resendCountdown === 0 && styles.resendTextActive]}>
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
                <Ionicons name="arrow-back" size={16} color={colors.text.secondary} style={{marginRight: 5}} />
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 132, 195, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#fff',
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 15,
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
    color: '#ddd',
    fontSize: 14,
  },
  resendTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ddd',
    fontSize: 14,
  }
});

export default OtpVerificationScreen;