import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, globalStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - replace with your server URL
const API_URL = 'http://10.0.2.2:8000/api/v1'; // 10.0.2.2 is localhost for Android emulator

const AuthScreen = ({ navigation }) => {
  // State variables for different screens
  const [mode, setMode] = useState('login'); // login, signup, verifyOtp
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleOtpChange = (value, index) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);
    setOtp(newOtpArray.join(''));
    
    // Auto focus next input
    if (value !== '' && index < 5) {
      otpInputRef[index + 1].focus();
    }
  };
  
  // References for OTP inputs
  const otpInputRef = Array(6).fill(0).map(() => React.createRef());
  
  // Handle signup
  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      
      if (response.data.success) {
        setMode('verifyOtp');
        setIsLoading(false);
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error.response && error.response.data && error.response.data.message) {
        // If user already exists but not verified
        if (error.response.status === 200 && error.response.data.data && error.response.data.data.email) {
          setMode('verifyOtp');
          Alert.alert('Verification Required', error.response.data.message);
          return;
        }
        
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to register. Please try again.');
      }
    }
  };
  
  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      if (response.data.success) {
        // Store tokens and user data
        await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Navigate to home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error.response && error.response.data) {
        // If account not verified
        if (error.response.status === 403 && error.response.data.data && error.response.data.data.email) {
          setMode('verifyOtp');
          Alert.alert('Verification Required', error.response.data.message);
          return;
        }
        
        Alert.alert('Error', error.response.data.message || 'Login failed');
      } else {
        Alert.alert('Error', 'Failed to login. Please try again.');
      }
    }
  };
  
  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!email || !otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });
      
      if (response.data.success) {
        // Store tokens and user data
        await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        setIsLoading(false);
        
        // Navigate to home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error.response && error.response.data) {
        Alert.alert('Error', error.response.data.message || 'OTP verification failed');
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        email,
      });
      
      setIsLoading(false);
      
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error.response && error.response.data) {
        Alert.alert('Error', error.response.data.message || 'Failed to resend OTP');
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    }
  };
  
  // Render login form
  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Welcome Back</Text>
      <Text style={styles.formSubtitle}>Sign in to continue</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.authButton} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.authButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('signup')} style={styles.switchModeButton}>
        <Text style={styles.switchModeText}>Don't have an account? <Text style={styles.switchModeHighlight}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render signup form
  const renderSignupForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.formSubtitle}>Sign up to get started</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.text.secondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.authButton} onPress={handleSignup} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.authButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('login')} style={styles.switchModeButton}>
        <Text style={styles.switchModeText}>Already have an account? <Text style={styles.switchModeHighlight}>Sign in</Text></Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render OTP verification form
  const renderOtpVerificationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Verify Your Email</Text>
      <Text style={styles.formSubtitle}>Enter the 6-digit code sent to your email</Text>
      
      <View style={styles.otpContainer}>
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => otpInputRef[index] = ref}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={text => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && digit === '' && index > 0) {
                otpInputRef[index - 1].focus();
              }
            }}
          />
        ))}
      </View>
      
      <TouchableOpacity style={styles.authButton} onPress={handleVerifyOtp} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.authButtonText}>Verify</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton} disabled={isLoading}>
        <Text style={styles.resendText}>Didn't receive the code? <Text style={styles.resendHighlight}>Resend</Text></Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('login')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={16} color={colors.text.secondary} />
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Champions Arena</Text>
        </View>
        
        {mode === 'login' && renderLoginForm()}
        {mode === 'signup' && renderSignupForm()}
        {mode === 'verifyOtp' && renderOtpVerificationForm()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text.primary,
    paddingHorizontal: 10,
  },
  passwordToggle: {
    padding: 10,
  },
  authButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchModeText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  switchModeHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 18,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  resendHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  backButtonText: {
    marginLeft: 5,
    color: colors.text.secondary,
    fontSize: 14,
  },
});

export default AuthScreen; 