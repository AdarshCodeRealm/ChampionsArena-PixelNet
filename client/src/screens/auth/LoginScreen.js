import React, { useState } from 'react';
import {View, Text,
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
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email');
      return false;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Missing Information', 'Please enter your password');
      return false;
    }
    
    if (!policyAccepted) {
      Alert.alert('Terms & Privacy Policy', 'Please accept our Terms of Service and Privacy Policy to continue');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.loginWithPassword(email, password);

      if (response.success) {
        // Login successful
        login(response.accessToken, response.refreshToken, response.user);
      } else if (response.userNotFound) {
        // User doesn't exist - prompt to register
        Alert.alert(
          'Account Not Found',
          'No account found with this email. Would you like to create a new account?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Register',
              onPress: () => navigation.navigate('Register', { email })
            }
          ]
        );
      } else {
        // Invalid credentials or other error
        Alert.alert('Login Failed', response.message || 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Login Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to password reset screen or send password reset email
    Alert.alert(
      'Reset Password',
      'Would you like to receive a password reset link via email?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            if (!email.trim() || !validateEmail(email)) {
              Alert.alert('Invalid Email', 'Please enter a valid email address first');
              return;
            }
            
            setIsLoading(true);
            try {
              const response = await authService.resetPassword(email);
              
              if (response.success) {
                Alert.alert('Reset Link Sent', 'Please check your email for password reset instructions');
              } else {
                Alert.alert('Error', response.message || 'Failed to send reset link');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
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
              
              <View style={styles.authTypeContainer}>
                <TouchableOpacity 
                  style={[styles.authTypeTab, styles.authTypeTabActive]}
                  onPress={() => {}}
                >
                  <Text style={[styles.authTypeText, styles.authTypeTextActive]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.authTypeTab}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.authTypeText}>Register</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.missionContainer}>
                <Text style={styles.missionTitle}>Player Login</Text>
                <Text style={styles.missionText}>
                  Sign in to your Champions Arena account to join tournaments, track your progress,
                  and compete with players worldwide.
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
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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
              
              <TouchableOpacity 
                style={styles.forgotPasswordButton} 
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
              
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
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
              
              <View style={styles.newUserContainer}>
                <Text style={styles.newUserText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.newUserLink}>Register Now</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.additionalLinks}>
                <TouchableOpacity onPress={openRefundPolicy}>
                  <Text style={styles.linkText}>Refund Policy</Text>
                </TouchableOpacity>
                <Text style={styles.linkDivider}>•</Text>
                <TouchableOpacity onPress={openPrivacyPolicy}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.linkDivider}>•</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Help</Text>
                </TouchableOpacity>
              </View>
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
  missionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    width: '100%',
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
    marginBottom: 15,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
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
  newUserContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  newUserText: {
    color: '#ddd',
    fontSize: 14,
  },
  newUserLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
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
});

export default LoginScreen;