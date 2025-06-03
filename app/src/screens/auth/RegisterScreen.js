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
  Linking,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = ({ route, navigation }) => {
  // Get email from navigation params if redirected from login screen
  const { email: routeEmail } = route.params || {};
  
  // Get auth methods from context 
  const { registerWithOtp, authError } = useAuth();
  
  // State for registration
  const [isLoading, setIsLoading] = useState(false);
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
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Form validation
  const validateForm = () => {
    // Email validation
    if (!formData.email || !formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email');
      return false;
    }
    
    if (!validateEmail(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Name validation
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return false;
    }

    // Username validation
    if (!formData.username.trim()) {
      Alert.alert('Missing Information', 'Please enter a username');
      return false;
    }
    
    // Password validation
    if (!formData.password.trim()) {
      Alert.alert('Missing Information', 'Please enter a password');
      return false;
    }
    
    if (formData.password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    // FreeFire UID validation
    if (!formData.uid.trim()) {
      Alert.alert('Missing Information', 'Please enter your FreeFire UID');
      return false;
    }

    // Terms acceptance validation
    if (!policyAccepted) {
      Alert.alert('Terms & Privacy Policy', 'Please accept our Terms of Service and Privacy Policy to continue');
      return false;
    }

    return true;
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
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        email: formData.email,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        uid: formData.uid,
        mobileNumber: formData.mobileNumber || undefined,
      };

      // Register with OTP using our enhanced AuthContext
      const response = await registerWithOtp(userData, profileImage);
      
      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('OtpVerification', {
          email: formData.email,
          flowType: 'registration',
          title: 'Verify Registration'
        });
      } else {
        Alert.alert('Registration Failed', response.message || 'Failed to initiate registration');
      }
    } catch (error) {
      // Display error from AuthContext if available
      Alert.alert('Registration Error', authError || error.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://championsarena.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://championsarena.com/terms-of-service');
  };

  return (
    <ImageBackground
      source={require('../../../assets/loginwallpaper.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoSection}>
              <Image
                source={require('../../../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Champions Arena</Text>
              <Text style={styles.subtitle}>Player Registration</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Profile Image Selection */}
              <View style={styles.profileImageContainer}>
                <TouchableOpacity 
                  style={styles.profileImageButton}
                  onPress={pickImage}
                >
                  {profileImage ? (
                    <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="camera" size={40} color="#fff" />
                      <Text style={styles.profileImageText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => updateFormField('email', value)}
                    placeholder="your.email@example.com"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!routeEmail} // Only editable if not set from route
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => updateFormField('name', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="at-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.username}
                    onChangeText={(value) => updateFormField('username', value)}
                    placeholder="Choose a username"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(value) => updateFormField('password', value)}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordVisibilityButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#aaa"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormField('confirmPassword', value)}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordVisibilityButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#aaa"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>FreeFire UID</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="game-controller-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.uid}
                    onChangeText={(value) => updateFormField('uid', value)}
                    placeholder="Your FreeFire user ID"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.mobileNumber}
                    onChangeText={(value) => updateFormField('mobileNumber', value)}
                    placeholder="Your mobile number"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>
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
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>REGISTER</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginPromptLink}>LOGIN</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => Linking.openURL('https://championsarena.com/privacy-policy')}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://championsarena.com/terms-of-service')}>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#eee',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
  },
  passwordVisibilityButton: {
    padding: 12,
  },
  policyCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
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
  registerButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginPromptText: {
    color: '#eee',
    fontSize: 14,
    marginRight: 5,
  },
  loginPromptLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerLink: {
    color: '#ddd',
    fontSize: 14,
  },
  footerDot: {
    color: '#ddd',
    paddingHorizontal: 8,
  },
});

export default RegisterScreen;