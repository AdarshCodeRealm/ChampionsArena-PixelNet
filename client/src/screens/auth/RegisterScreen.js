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
  // Get user data from navigation params if coming from OTP verification or Login screen
  const { email: routeEmail, userType: routeUserType, isOtpVerified } = route.params || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: routeEmail || '',
    userType: routeUserType || 'player',
    // Player specific fields
    username: '',
    uid: '',
    mobileNumber: '',
    // Organizer specific fields
    phoneNumber: '',
    companyName: '',
    upiId: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // This screen can now be accessed either from OTP verification or from Login (for non-existing users)
    // So we don't want to immediately redirect to login in all cases
    if (isOtpVerified === false && !routeEmail) {
      navigation.replace('Login');
    }
  }, [isOtpVerified, navigation, routeEmail]);

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const validateForm = () => {
    // Email validation
    if (!formData.email || !formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    // Common validation
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return false;
    }

    if (!formData.username.trim()) {
      Alert.alert('Missing Information', 'Please enter a username');
      return false;
    }

    // Terms acceptance
    if (!policyAccepted) {
      Alert.alert('Terms & Privacy Policy', 'Please accept our Terms of Service and Privacy Policy to continue');
      return false;
    }

    // User type specific validation
    if (formData.userType === 'player') {
      if (!formData.uid.trim()) {
        Alert.alert('Missing Information', 'Please enter your FreeFire UID');
        return false;
      }
    } else if (formData.userType === 'organizer') {
      if (!formData.phoneNumber.trim()) {
        Alert.alert('Missing Information', 'Please enter your phone number');
        return false;
      }
      if (!formData.companyName.trim()) {
        Alert.alert('Missing Information', 'Please enter your company name');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let userData = {
        email: formData.email,
        name: formData.name,
        username: formData.username,
        profilePicture: profileImage, // Include profile picture
      };
      
      // Add user type specific fields
      if (formData.userType === 'player') {
        userData = {
          ...userData,
          uid: formData.uid,
          mobileNumber: formData.mobileNumber || undefined,
        };
      } else {
        userData = {
          ...userData,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName,
          upiId: formData.upiId || undefined,
        };
      }
      
      // Initiate the OTP authentication process
      const response = await authService.initiateOtpAuth(userData, formData.userType);

      if (response.success) {
        // Navigate to OTP verification
        navigation.navigate('OtpVerification', {
          email: formData.email,
          userType: formData.userType,
          isRegistration: true,
        });
      } else {
        Alert.alert('Registration Failed', response.message || 'Failed to initiate registration');
      }
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserType = () => {
    setFormData(prev => ({
      ...prev,
      userType: prev.userType === 'player' ? 'organizer' : 'player'
    }));
  };

  const openPrivacyPolicy = () => {
    // Implementation for opening privacy policy
  };

  const openTermsOfService = () => {
    // Implementation for opening terms of service
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
            <Text style={styles.title}>Create Your Account</Text>
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

          {/* Common Fields */}
          <View style={styles.formSection}>            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateFormField('email', value)}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!routeEmail} // Only editable if not set from route
              />
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
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>I am a:</Text>
            <View style={styles.userTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'player' && styles.userTypeButtonActive,
                ]}
                onPress={() => updateFormField('userType', 'player')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    formData.userType === 'player' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Player
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'organizer' && styles.userTypeButtonActive,
                ]}
                onPress={() => updateFormField('userType', 'organizer')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    formData.userType === 'organizer' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Organizer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Player Fields */}
          {formData.userType === 'player' && (
            <View style={styles.formSection}>              
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
            </View>
          )}

          {/* Organizer Fields */}
          {formData.userType === 'organizer' && (
            <View style={styles.formSection}>              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateFormField('phoneNumber', value)}
                  placeholder="Your phone number"
                  placeholderTextColor={colors.text.placeholder}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.companyName}
                  onChangeText={(value) => updateFormField('companyName', value)}
                  placeholder="Your company or organization name"
                  placeholderTextColor={colors.text.placeholder}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>UPI ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.upiId}
                  onChangeText={(value) => updateFormField('upiId', value)}
                  placeholder="For receiving payments"
                  placeholderTextColor={colors.text.placeholder}
                />
              </View>
            </View>
          )}

          {/* Terms & Conditions */}
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {formData.userType === 'organizer' && (
            <View style={styles.organizerNote}>
              <Ionicons name="information-circle-outline" size={18} color="#fff" style={{marginRight: 5}} />
              <Text style={styles.organizerNoteText}>
                Organizer accounts require approval before hosting tournaments.
              </Text>
            </View>
          )}
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
  formSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
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
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#ccc',
    fontSize: 16,
  },
  userTypeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#fff',
    fontWeight: '600',
  },
  userTypeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  userTypeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  userTypeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  userTypeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
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
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  organizerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'orange',
  },
  organizerNoteText: {
    fontSize: 12,
    color: '#fff',
    flex: 1,
  },
});

export default RegisterScreen; 