import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { globalStyles, colors } from '../../styles/globalStyles';
import Header from '../../components/ui/Header';

const UpdateProfileScreen = ({ navigation }) => {
  const { userData, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    uid: '',
    email: '',
    mobileNumber: ''
  });
  const [privacy, setPrivacy] = useState({
    isProfilePublic: false,
    showEmail: false,
    showMobileNumber: false,
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        uid: userData.uid || '',
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || ''
      });
      setPrivacy({
        isProfilePublic: userData.isProfilePublic || false,
        showEmail: userData.showEmail || false,
        showMobileNumber: userData.showMobileNumber || false,
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSelectImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your photos to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use MediaTypeOptions.Images for expo-image-picker v16+
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Something went wrong with the image picker. Please try again.');
    }
  };

  const updatePrivacySetting = (field, value) => {
    setPrivacy(prevPrivacy => ({
      ...prevPrivacy,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Validation Error', 'Username is required');
      return;
    }

    try {
      setIsLoading(true);

      // Call the updateProfile method from AuthContext
      const response = await updateProfile(formData, profileImage, privacy);

      if (response.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header
        title="Update Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleSelectImage} style={styles.profileImageWrapper}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage.uri }
                  : userData?.profilePicture
                    ? { uri: userData.profilePicture }
                    : require('../../../assets/logo.jpg')
              }
              style={styles.profileImage}
            />
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Your full name"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="at-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Your in-game name"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game UID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="game-controller-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.uid}
                onChangeText={(value) => handleInputChange('uid', value)}
                placeholder="Your FreeFire UID"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.disabled }]}
                value={formData.email}
                editable={false}
                placeholder="Your email address"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.mobileNumber}
                onChangeText={(value) => handleInputChange('mobileNumber', value)}
                placeholder="Your mobile number"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Privacy Settings</Text>
          
          <View style={styles.privacySection}>
            <View style={styles.privacySetting}>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyLabel}>Public Profile</Text>
                <Text style={styles.privacyDescription}>Allow others to view your profile</Text>
              </View>
              <Switch
                value={privacy.isProfilePublic}
                onValueChange={(value) => updatePrivacySetting('isProfilePublic', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
            
            <View style={styles.privacySetting}>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyLabel}>Show Email</Text>
                <Text style={styles.privacyDescription}>Display your email on your profile</Text>
              </View>
              <Switch
                value={privacy.showEmail}
                onValueChange={(value) => updatePrivacySetting('showEmail', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
            
            <View style={styles.privacySetting}>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyLabel}>Show Mobile Number</Text>
                <Text style={styles.privacyDescription}>Display your mobile number on your profile</Text>
              </View>
              <Switch
                value={privacy.showMobileNumber}
                onValueChange={(value) => updatePrivacySetting('showMobileNumber', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, isLoading && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    color: colors.primary,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingVertical: 10,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacySection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  privacySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  privacyDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
});

export default UpdateProfileScreen;