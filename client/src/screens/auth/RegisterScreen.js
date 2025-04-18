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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { colors } from '../../styles/globalStyles';

const RegisterScreen = ({ route, navigation }) => {
  // Get user data from navigation params
  const { email, userType, isOtpVerified } = route.params || {};
  const [formData, setFormData] = useState({
    name: '',
    email: email || '',
    userType: userType || 'player',
    // Player specific fields
    username: '',
    uid: '',
    mobileNumber: '',
    // Organizer specific fields
    phoneNumber: '',
    companyName: '',
    upiId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Redirect to login if not coming from OTP verification
    if (!isOtpVerified) {
      navigation.replace('Login');
    }
  }, [isOtpVerified, navigation]);

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    // Common validation
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return false;
    }

    // User type specific validation
    if (formData.userType === 'player') {
      if (!formData.username.trim()) {
        Alert.alert('Missing Information', 'Please enter your in-game name (IGN)');
        return false;
      }
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
      if (!formData.upiId.trim()) {
        Alert.alert('Missing Information', 'Please enter your UPI ID for payments');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;
      
      // Create registration data based on user type
      if (formData.userType === 'player') {
        response = await authService.initiateOtpAuth({
          email: formData.email,
          name: formData.name,
          username: formData.username,
          uid: formData.uid,
          mobileNumber: formData.mobileNumber || undefined,
        }, 'player');
      } else {
        response = await authService.initiateOtpAuth({
          email: formData.email,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName,
          upiId: formData.upiId,
        }, 'organizer');
      }

      if (response.success) {
        // Since we already verified OTP earlier, we can consider this registration complete
        // In a real app, you might want to verify OTP again or use a token from the previous verification
        Alert.alert(
          'Registration Complete', 
          `Your ${formData.userType} account has been created successfully.${
            formData.userType === 'organizer' ? ' Admin approval may be required before you can access all features.' : ''
          }`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('OtpVerification', {
                email: formData.email,
                userType: formData.userType,
              })
            }
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

  return (
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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            {formData.userType === 'player'
              ? 'Set up your player profile to join tournaments'
              : 'Create your organizer account to host tournaments'}
          </Text>
        </View>

        {/* Common Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.inputDisabled}
              value={formData.email}
              editable={false}
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
        </View>

        {/* Player Fields */}
        {formData.userType === 'player' && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Player Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>In-Game Name (IGN)</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => updateFormField('username', value)}
                placeholder="Your in-game name"
                placeholderTextColor={colors.text.placeholder}
              />
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
          </View>
        )}

        {/* Organizer Fields */}
        {formData.userType === 'organizer' && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Organizer Details</Text>
            
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
              <Text style={styles.label}>UPI ID</Text>
              <TextInput
                style={styles.input}
                value={formData.upiId}
                onChangeText={(value) => updateFormField('upiId', value)}
                placeholder="Your UPI ID for payments"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Registration</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {formData.userType === 'player' 
            ? 'Your FreeFire UID and username will be visible to others during tournaments.' 
            : 'Organizer accounts require admin approval before you can create tournaments.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputDisabled: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    marginTop: 20,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default RegisterScreen; 