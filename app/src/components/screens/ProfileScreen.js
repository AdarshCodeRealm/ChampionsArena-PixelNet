import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from 'expo-image-picker';
import Header from "../ui/Header";
import SectionHeader from "../ui/SectionHeader";
import { globalStyles, profileStyles } from "../../styles/globalStyles";
import { colors } from "../../styles/globalStyles";
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';
import { API_URL, AUTH_ROUTES } from "../../config/constants";
import authService from "../../services/authService";

// Mock data as fallback only
const USER_PROFILE = {
  name: "John Doe",
  username: "@johndoe",
  avatar: "https://via.placeholder.com/80",
  rank: "Diamond III",
  level: 52,
};

// Menu items
const MENU_ITEMS = [
  { id: "1", title: "Creator Profile", icon: "person" },
  { id: "2", title: "Manage Matches", icon: "calendar", requiresOrganizerApproval: true },
  { id: "3", title: "Manage Communities", icon: "shield" },
  { id: "4", title: "Manage Teams", icon: "people" },
  { id: "5", title: "Giveaways", icon: "gift" },
  { id: "6", title: "Claim Gift Card", icon: "card" },
  { id: "7", title: "Store", icon: "storefront" },
  { id: "8", title: "Offers Wall", icon: "cash" },
  { id: "9", title: "Convert Play Balance", icon: "wallet" },
  { id: "10", title: "Game Zone", icon: "game-controller" },
  { id: "11", title: "Leaderboard", icon: "stats-chart", isNew: true },
  { id: "12", title: "Privacy Settings", icon: "settings", isNew: true },
];

const ProfileScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingProfilePic, setIsUpdatingProfilePic] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    isProfilePublic: true,
    showEmail: false,
    showMobileNumber: false
  });
  const { userData, userToken, logout } = useAuth();
  
  const isAuthenticated = !!userToken;
  const isGuestUser = userData?.id === 'guest';

  // Check if user is an approved organizer
  const isApprovedOrganizer = userData?.userType === 'organizer' && userData?.isApproved === true;

  // Load privacy settings when component mounts
  useEffect(() => {
    if (userData && userData.privacySettings) {
      setPrivacySettings(userData.privacySettings);
    }
  }, [userData]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = (item) => {
    console.log("Menu item pressed:", item);

    if (item.title === "Leaderboard") {
      setMenuVisible(false);
      navigation.navigate("Leaderboard");
    } else if (item.title === "Manage Matches") {
      // Only navigate if user is an approved organizer
      if (isApprovedOrganizer) {
        setMenuVisible(false);
        navigation.navigate("ManageMatches");
      } else {
        Alert.alert(
          "Access Restricted",
          "Only approved organizers can manage matches.",
          [{ text: "OK" }]
        );
      }
    } else if (item.title === "Privacy Settings") {
      setMenuVisible(false);
      // Toggle privacy settings modal or navigate to privacy settings
      setShowPrivacyModal(true);
    } else {
      // Handle other menu items
    }
  };

  // Handle privacy settings updates
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const updatePrivacySetting = async (setting, value) => {
    try {
      // Update local state
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Update on server
      if (userToken) {
        await axios.put(
          `${API_URL}${AUTH_ROUTES.PRIVACY_SETTINGS}`, 
          { [setting]: value },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      }
    } catch (error) {
      console.log('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
      // Revert local state on error
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: !value
      }));
    }
  };

  const handleViewAllPress = () => {
    console.log("View all matches pressed");
    navigation.navigate("ManageMatches");
  };
  
  const handleLoginPress = async () => {
    // For guest users, first logout and then the auth context will handle navigation
    if (isGuestUser) {
      try {
        setIsLoading(true);
        await logout();
        // No need to navigate - the AuthContext will change userToken
        // which will automatically switch to the auth navigator
      } catch (error) {
        console.log('Error logging out guest user:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For non-authenticated users, we're already in the auth stack
      // so no action needed
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      // When logged out, menu will be closed automatically
      // as the userData and userToken will be set to null
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render login prompt for unauthenticated or guest users
  const renderLoginPrompt = () => {
    return (
      <View style={styles.loginPromptContainer}>
        <Ionicons name="person-circle-outline" size={100} color={colors.primary} style={styles.loginIcon} />
        
        <Text style={styles.loginTitle}>
          {isGuestUser ? "Switch to a Full Account" : "Login to Access Your Profile"}
        </Text>
        
        <Text style={styles.loginDescription}>
          {isGuestUser 
            ? "You're currently using a guest account. Create a full account to track your tournaments, manage your teams, and access all features."
            : "Sign in to view your profile, track your tournaments, manage your teams, and access exclusive features."}
        </Text>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>
            {isGuestUser ? "Switch to Full Account" : "Login / Register"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="trophy-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Join tournaments</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Create or join teams</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Track your performance</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="gift-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Win prizes and rewards</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render the privacy settings modal
  const renderPrivacySettings = () => {
    if (!showPrivacyModal) return null;
    
    return (
      <View style={styles.privacyModalContainer}>
        <View style={styles.privacyModal}>
          <View style={styles.privacyModalHeader}>
            <Text style={styles.privacyModalTitle}>Privacy Settings</Text>
            <TouchableOpacity 
              onPress={() => setShowPrivacyModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.privacyModalBody}>
            <View style={styles.privacySetting}>
              <Text style={styles.privacySettingText}>Public Profile</Text>
              <Switch
                value={privacySettings.isProfilePublic}
                onValueChange={(value) => updatePrivacySetting('isProfilePublic', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
            
            <View style={styles.privacySetting}>
              <Text style={styles.privacySettingText}>Show Email</Text>
              <Switch
                value={privacySettings.showEmail}
                onValueChange={(value) => updatePrivacySetting('showEmail', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
            
            <View style={styles.privacySetting}>
              <Text style={styles.privacySettingText}>Show Mobile Number</Text>
              <Switch
                value={privacySettings.showMobileNumber}
                onValueChange={(value) => updatePrivacySetting('showMobileNumber', value)}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.privacyModalButton} 
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text style={styles.privacyModalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get profile data with fallback for different property names
  const getProfileData = () => {
    if (userData) {
      return {
        name: userData.name || userData.displayName || userData.fullName || "User",
        username: userData.username || userData.userName || userData.email || "@user",
        profilePicture: userData.profilePicture || userData.avatar || userData.profileImage || userData.photoUrl || "https://via.placeholder.com/80",
        rank: userData.rank || "Player",
        level: userData.level || 1,
        stats: userData.stats || {
          totalMatches: 0,
          matchesWon: 0,
          killCount: 0,
          tournamentsParticipated: 0,
          tournamentsWon: 0
        },
        email: userData.email || "",
        mobileNumber: userData.mobileNumber || "",
        uid: userData.uid || userData.gameUID || userData.gameId || "",
        privacySettings: userData.privacySettings || {
          isProfilePublic: true,
          showEmail: false,
          showMobileNumber: false
        }
      };
    }
    return USER_PROFILE;
  };

  const profileData = getProfileData();
  
  // Only use profile data for header if userData exists
  const headerProfile = isAuthenticated && userData ? profileData : null;
  
  // Function to handle profile picture update
  const handleProfilePictureUpdate = async () => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your photos to update your profile picture.');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use MediaTypeOptions.Images for expo-image-picker v16+
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Start loading
        setIsUpdatingProfilePic(true);
        
        // Call the service to update profile icon
        try {
          const response = await authService.updateProfileIcon(selectedImage, userToken);
          
          if (response.success) {
            // Update the user data to reflect changes immediately
            const updatedUserData = {
              ...userData,
              profilePicture: response.data.profilePicture
            };
            
            // Update the Auth context with new user data
            if (typeof logout === 'function') {
              // Refresh the user data somehow
              // This depends on your auth implementation
              // For now, we'll just show a success message
              Alert.alert('Success', 'Profile picture updated successfully!');
            }
          } else {
            Alert.alert('Error', 'Failed to update profile picture. Please try again.');
          }
        } catch (error) {
          console.error('Error updating profile picture:', error);
          Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Something went wrong with the image picker. Please try again.');
    } finally {
      setIsUpdatingProfilePic(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header
        title="Champions Arena"
        profile={headerProfile}
        onProfilePress={isAuthenticated && !isGuestUser ? toggleMenu : handleLoginPress}
      />

      {/* Privacy Settings Modal */}
      {renderPrivacySettings()}

      {isAuthenticated && !isGuestUser && menuVisible ? (
        <ScrollView style={profileStyles.menuContainer}>
          <View style={profileStyles.profileSection}>
            <Image
              source={{ uri: profileData.profilePicture }}
              style={profileStyles.profileImage}
            />
            <View style={profileStyles.profileInfo}>
              <Text style={[profileStyles.menuItemText, { marginBottom: 5 }]}>
                {profileData.name}
              </Text>
              <Text style={profileStyles.profileUsername}>
                {profileData.username}
              </Text>
            </View>
          </View>

          {MENU_ITEMS.map((item) => {
            // Skip menu items that require organizer approval if user is not an approved organizer
            if (item.requiresOrganizerApproval && !isApprovedOrganizer) {
              return null;
            }
            
            return (
              <TouchableOpacity
                key={item.id}
                style={profileStyles.menuItem}
                onPress={() => handleMenuItemPress(item)}
              >
                <View style={profileStyles.menuIconContainer}>
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>
                <Text style={profileStyles.menuItemText}>{item.title}</Text>
                {item.isNew && (
                  <View style={profileStyles.newBadge}>
                    <Text style={profileStyles.newBadgeText}>New</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity
            style={[profileStyles.menuItem, { marginTop: 20 }]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <View style={[profileStyles.menuIconContainer, { backgroundColor: colors.status.danger }]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="log-out" size={20} color="#fff" />
              )}
            </View>
            <Text style={profileStyles.menuItemText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={globalStyles.container}>
          {isAuthenticated && !isGuestUser ? (
            <>
              {/* Redesigned Profile Header - More Compact with Image Left, Info Right */}
              <View style={styles.profileCard}>
                <TouchableOpacity 
                  onPress={handleProfilePictureUpdate}
                  disabled={isUpdatingProfilePic}
                  style={styles.profileImageContainer}
                >
                  {isUpdatingProfilePic ? (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  ) : (
                    <View style={styles.profileImageOverlay}>
                      <Ionicons name="pencil" size={20} color="#fff" />
                    </View>
                  )}
                  <Image
                    source={{ uri: profileData.profilePicture }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName}>{profileData.name}</Text>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => navigation.navigate("UpdateProfile")}
                    >
                      <Ionicons name="create-outline" size={24} color={colors.primary} fontWeight="bold" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.profileUsername}>{profileData.username}</Text>
                  
                  {/* Only show UID */}
                  <View style={styles.contactItem}>
                    <Ionicons name="game-controller-outline" size={16} color={colors.text.secondary} />
                    <Text style={styles.contactText}>UID: {profileData.uid || "Not set"}</Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats Row */}
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatNumber}>{profileData.stats?.totalMatches || 0}</Text>
                  <Text style={styles.quickStatLabel}>Played</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatNumber}>{profileData.stats?.killCount || 0}</Text>
                  <Text style={styles.quickStatLabel}>Kills</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatNumber}>
                    {profileData.stats?.totalMatches > 0 
                      ? Math.round((profileData.stats?.matchesWon / profileData.stats?.totalMatches) * 100) 
                      : 0}%>
                  </Text>
                  <Text style={styles.quickStatLabel}>Win Rate</Text>
                </View>
              </View>

              <View style={globalStyles.card}>
                <Text style={styles.sectionCardTitle}>Achievements</Text>
                <View style={styles.achievementRow}>
                  <View style={styles.achievement}>
                    <View style={styles.achievementIcon}>
                      <Ionicons
                        name="trophy"
                        size={24}
                        color={colors.status.gold}
                      />
                    </View>
                    <Text style={styles.achievementText}>
                      Tournament Winner
                    </Text>
                  </View>
                  <View style={styles.achievement}>
                    <View style={styles.achievementIcon}>
                      <Ionicons name="star" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.achievementText}>Top Player</Text>
                  </View>
                </View>
              </View>

              <View style={globalStyles.card}>
                <SectionHeader
                  title="Recent Matches"
                  showViewAll={true}
                  onViewAllPress={handleViewAllPress}
                />
                {[1, 2, 3].map((item) => (
                  <View key={item} style={styles.matchHistoryItem}>
                    <View
                      style={[
                        styles.matchResult,
                        { backgroundColor: item === 1 ? colors.status.success : colors.status.danger }
                      ]}
                    >
                      <Text style={styles.matchResultText}>
                        {item === 1 ? "W" : "L"}
                      </Text>
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>Tournament Match #{item}</Text>
                      <Text style={styles.matchDate}>2 days ago</Text>
                    </View>
                    <Text style={styles.matchKills}>+{5 + item} kills</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            renderLoginPrompt()
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  quickStatsRow: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  matchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchResult: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  matchResultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  matchDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  matchKills: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginIcon: {
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 12,
  },
  privacyModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  privacyModal: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  privacyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  privacyModalBody: {
    marginBottom: 20,
  },
  privacySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  privacySettingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  privacyModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  privacyModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
