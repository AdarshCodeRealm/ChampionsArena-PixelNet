import React, { useState } from 'react';
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
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';
import { colors } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('player'); // 'player' or 'organizer'
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleContinue = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!policyAccepted) {
      Alert.alert('Terms & Privacy Policy', 'Please accept our Terms of Service and Privacy Policy to continue');
      return;
    }

    setIsLoading(true);

    try {
      // For existing users, only email is required
      // For new users, additional information will be collected after OTP verification
      const response = await authService.initiateOtpAuth({ email }, userType);

      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('OtpVerification', {
          email,
          userType,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to initiate authentication');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip authentication and set a temporary bypass token
    const tempToken = 'guest-bypass-token';
    // Create a guest user object
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      username: '@guest',
      email: 'guest@example.com',
      userType: 'player',
      isVerified: true,
      profilePicture: null,
      rank: 'Unranked',
      level: 1
    };
    
    // Use the login function from AuthContext to set a temporary token
    login(tempToken, tempToken, guestUser);
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://championsarena.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://championsarena.com/terms-of-service');
  };

  const openRefundPolicy = () => {
    Linking.openURL('https://championsarena.com/refund-policy');
  };

  const toggleUserType = () => {
    setUserType(userType === 'player' ? 'organizer' : 'player');
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
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/logo.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.title}>Champions Arena</Text>
              <Text style={styles.subtitle}>Global Gaming Tournament Platform</Text>
              
              <View style={styles.missionContainer}>
                <Text style={styles.missionTitle}>Our Mission</Text>
                <Text style={styles.missionText}>
                  Empowering gamers to build professional careers and compete on a global scale. 
                  Join our community of elite players and take your gaming to the next level.
                </Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.text.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>I am a:</Text>
                <View style={styles.userTypeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'player' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('player')}
                  >
                    <Text
                      style={[
                        styles.userTypeButtonText,
                        userType === 'player' && styles.userTypeButtonTextActive,
                      ]}
                    >
                      Player
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'organizer' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('organizer')}
                  >
                    <Text
                      style={[
                        styles.userTypeButtonText,
                        userType === 'organizer' && styles.userTypeButtonTextActive,
                      ]}
                    >
                      Organizer
                    </Text>
                  </TouchableOpacity>
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
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
              
              <View style={styles.additionalLinks}>
                <TouchableOpacity onPress={openRefundPolicy}>
                  <Text style={styles.linkText}>Refund Policy</Text>
                </TouchableOpacity>
                <Text style={styles.linkDivider}>•</Text>
                <TouchableOpacity onPress={openPrivacyPolicy}>
                  <Text style={styles.linkText}>Payment Policy</Text>
                </TouchableOpacity>
                <Text style={styles.linkDivider}>•</Text>
                <TouchableOpacity onPress={openPrivacyPolicy}>
                  <Text style={styles.linkText}>Help</Text>
                </TouchableOpacity>
              </View>
              
              {userType === 'organizer' && (
                <View style={styles.organizerNote}>
                  <Ionicons name="information-circle-outline" size={18} color="#fff" style={{marginRight: 5}} />
                  <Text style={styles.organizerNoteText}>
                    Organizer accounts require approval before hosting tournaments.
                  </Text>
                </View>
              )}
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
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 75,
    padding: 5,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#eee',
    marginBottom: 20,
    textAlign: 'center',
  },
  missionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  missionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    width: '100%',
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
  skipButton: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: '#ddd',
    fontSize: 16,
  },
  additionalLinks: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#ddd',
    textDecorationLine: 'underline',
  },
  linkDivider: {
    color: '#ddd',
    paddingHorizontal: 8,
  },
  organizerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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

export default LoginScreen; 