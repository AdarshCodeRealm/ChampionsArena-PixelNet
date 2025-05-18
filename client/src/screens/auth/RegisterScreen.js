import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { colors } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = ({ route, navigation }) => {
  // Get email from navigation params if redirected from login screen
  const { email: routeEmail } = route.params || {};
  
  // State for multi-step registration
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Email input, 2: OTP verification, 3: Complete profile
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    email: routeEmail || '',
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    uid: '', // FreeFire UID
    mobileNumber: '',
    otp: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP resend timer countdown
  useEffect(() => {
    let interval;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((timer) => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Update form field helper
  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle profile image picking
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  // Step 1: Email input and request OTP
  const handleSendOtp = async () => {
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!policyAccepted) {
      Alert.alert('Terms & Privacy Policy', 'Please accept our Terms of Service and Privacy Policy to continue');
      return;
    }

    setIsLoading(true);
    try {
      // Initiate OTP auth with just the email for player registration
      const response = await authService.initiateOtpAuth({ email: formData.email }, 'player');
      
      if (response.success) {
        setOtpSent(true);
        setRegistrationStep(2);
        setOtpResendTimer(30); // 30-second cooldown for resend
        Alert.alert('OTP Sent', 'A verification code has been sent to your email.');
      } else {
        Alert.alert('Failed', response.message || 'Failed to send verification code.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and proceed
  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      // This will only verify the OTP, not complete the registration yet
      // We're adapting the existing verifyOtp method but not saving the auth state
      // since the user hasn't completed their registration
      const response = await authService.verifyOtp(
        formData.email,
        formData.otp,
        'player',
        false // Don't remember me yet since registration is incomplete
      );

      if (response.success) {
        // OTP is verified, move to complete profile step
        setRegistrationStep(3);
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid verification code.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to verify your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;

    setIsLoading(true);
    try {
      const response = await authService.resendOtp(formData.email, 'player');
      
      if (response.success) {
        setOtpResendTimer(30); // Reset cooldown timer
        Alert.alert('OTP Resent', 'A new verification code has been sent to your email.');
      } else {
        Alert.alert('Failed', response.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete registration with profile details
  const handleCompleteRegistration = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Missing Information', 'Please enter a username');
      return;
    }
    
    // Password validation
    if (!formData.password.trim()) {
      Alert.alert('Missing Information', 'Please enter a password');
      return;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    // FreeFire UID validation
    if (!formData.uid.trim()) {
      Alert.alert('Missing Information', 'Please enter your FreeFire UID');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        email: formData.email,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        uid: formData.uid,
        mobileNumber: formData.mobileNumber || undefined,
        otp: formData.otp, // Include the OTP for final verification
        isOtpVerified: true
      };

      // Register the player with complete details
      const response = await authService.registerPlayer(userData);

      if (response.success) {
        // If profile image exists, upload it
        if (profileImage) {
          try {
            // Upload profile image logic would go here
            // This might involve an API call to update the user's profile picture
          } catch (imageError) {
            console.error('Failed to upload profile image:', imageError);
            // Continue with login even if image upload fails
          }
        }

        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [
            {
              text: 'Login Now',
              onPress: () => {
                // Navigate to login screen and clear the stack
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.message || 'Failed to complete registration');
      }
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    // Implementation for opening privacy policy
  };

  const openTermsOfService = () => {
    // Implementation for opening terms of service
  };

  // Render based on current registration step
  const renderStepContent = () => {
    switch (registrationStep) {
      case 1:
        return (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.activeStepDot]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Step 1: Enter Your Email</Text>
            <Text style={styles.stepDescription}>
              We'll send a verification code to your email address to confirm it's really you.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateFormField('email', value)}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!routeEmail} // Only editable if not set from route
              />
            </View>

            <TouchableOpacity 
              style={styles.policyCheckbox} 
              onPress={() => setPolicyAccepted(!policyAccepted)}
            >
              <View style={[styles.checkbox, policyAccepted && styles.checkboxChecked]}>
                {policyAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.policyText}>
                I agree to the{' '}
                <Text style={styles.policyLink} onPress={openTermsOfService}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.policyLink} onPress={openPrivacyPolicy}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.completedStepDot]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.activeStepDot]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Step 2: Verify Your Email</Text>
            <Text style={styles.stepDescription}>
              Enter the 6-digit verification code we sent to {formData.email}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={formData.otp}
                onChangeText={(value) => updateFormField('otp', value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={[styles.resendButton, otpResendTimer > 0 && styles.resendButtonDisabled]}
              onPress={handleResendOtp}
              disabled={otpResendTimer > 0}
            >
              <Text style={styles.resendButtonText}>
                {otpResendTimer > 0 
                  ? `Resend code in ${otpResendTimer}s` 
                  : 'Resend verification code'}
              </Text>
            </TouchableOpacity>

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
              style={styles.backButton}
              onPress={() => setRegistrationStep(1)}
            >
              <Text style={styles.backButtonText}>Back to Email</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.completedStepDot]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.completedStepDot]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.activeStepDot]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Step 3: Complete Your Profile</Text>
            <Text style={styles.stepDescription}>
              Fill in your details to complete your Champions Arena player profile.
            </Text>

            {/* Profile Image Selection */}
            <View style={styles.profileImageContainer}>
              <TouchableOpacity 
                style={styles.profileImageButton}
                onPress={pickImage}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#fff" />
                    <Text style={styles.profileImageText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateFormField('name', value)}
                placeholder="Enter your full name"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => updateFormField('username', value)}
                placeholder="Choose a username"
                placeholderTextColor={colors.text.placeholder}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(value) => updateFormField('password', value)}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.text.placeholder}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordVisibilityButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
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
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormField('confirmPassword', value)}
                  placeholder="Confirm your password"
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>FreeFire UID</Text>
              <TextInput
                style={styles.input}
                value={formData.uid}
                onChangeText={(value) => updateFormField('uid', value)}
                placeholder="Your FreeFire user ID"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.mobileNumber}
                onChangeText={(value) => updateFormField('mobileNumber', value)}
                placeholder="Your mobile number"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleCompleteRegistration}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setRegistrationStep(2)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#1e3c72']}
      style={styles.backgroundGradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Player Registration</Text>
            <Text style={styles.subtitle}>
              Join Champions Arena and start your gaming journey
            </Text>
          </View>

          <View style={styles.authTypeContainer}>
            <TouchableOpacity 
              style={styles.authTypeTab}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.authTypeText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authTypeTab, styles.authTypeTabActive]}
              onPress={() => {}}
            >
              <Text style={[styles.authTypeText, styles.authTypeTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {renderStepContent()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    marginBottom: 10,
  },
  authTypeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    overflow: 'hidden',
  },
  authTypeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authTypeTabActive: {
    backgroundColor: colors.primary,
  },
  authTypeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  authTypeTextActive: {
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeStepDot: {
    backgroundColor: colors.primary,
    borderColor: '#fff',
  },
  completedStepDot: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 25,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  otpInput: {
    fontSize: 18,
    letterSpacing: 5,
    textAlign: 'center',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  policyCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  policyText: {
    fontSize: 14,
    color: '#ddd',
    flex: 1,
  },
  policyLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#ddd',
    fontSize: 14,
  },
});

export default RegisterScreen;