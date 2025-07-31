import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const OtpVerificationModal = ({ 
  visible, 
  onClose, 
  email,
  onSuccess,
  flowType = 'registration',
  title = 'Verify Your Email'
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const { verifyOtp, resendOtp, authError } = useAuth();
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      // Reset OTP when modal opens
      setOtp(['', '', '', '', '', '']);
      setResendCountdown(30);
      
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
      
      // Focus first input when modal opens
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
      
      return () => clearInterval(countdownInterval);
    }
  }, [visible]);

  const handleOtpChange = (value, index) => {
    // Only accept numbers
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-advance to next input if current input is filled
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Go to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verifyOtp(email, otpValue, true);
      
      if (response.success) {
        Alert.alert('Success', 'Email verified successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              onClose();
              if (onSuccess) {
                onSuccess(response);
              }
            }
          }
        ]);
      } else {
        Alert.alert('Verification Failed', response.message || 'Failed to verify OTP. Please try again.');
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
        // Reset OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="mail" size={40} color={colors.primary} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Enter the 6-digit verification code sent to:
          </Text>
          <Text style={styles.email}>{email}</Text>
          
          {/* Info message */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {flowType === 'registration' 
                ? "Complete your registration by verifying your email"
                : "Verify your email to continue"}
            </Text>
          </View>
          
          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
              />
            ))}
          </View>
          
          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>
          
          {/* Resend Code */}
          <TouchableOpacity 
            style={styles.resendContainer}
            onPress={handleResendOtp}
            disabled={resendCountdown > 0 || isLoading}
          >
            <Text style={[
              styles.resendText, 
              resendCountdown === 0 && !isLoading ? styles.resendTextActive : null
            ]}>
              {resendCountdown > 0 
                ? `Resend code in ${resendCountdown}s` 
                : 'Resend verification code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 132, 195, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(13, 132, 195, 0.1)',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    paddingVertical: 8,
  },
  resendText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  resendTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default OtpVerificationModal;