import React, { useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../ui/Header";
import SectionHeader from "../ui/SectionHeader";
import { globalStyles, profileStyles } from "../../styles/globalStyles";
import { colors } from "../../styles/globalStyles";
import { useAuth } from "../../contexts/AuthContext";

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
];

const ProfileScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userData, userToken, logout } = useAuth();
  
  const isAuthenticated = !!userToken;
  const isGuestUser = userData?.id === 'guest';

  // Check if user is an approved organizer
  const isApprovedOrganizer = userData?.userType === 'organizer' && userData?.isApproved === true;

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
    } else {
      // Handle other menu items
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

  // The profile to display in header
  const profileToDisplay = isAuthenticated && !isGuestUser ? userData : null;

  // Get profile data with fallback for different property names
  const getProfileData = () => {
    if (userData) {
      console.log("Current userData:", userData); // Debug log to see actual data
      return {
        name: userData.name || userData.displayName || userData.fullName || "User",
        username: userData.username || userData.userName || userData.email || "@user",
        profilePicture: userData.profilePicture || userData.avatar || userData.profileImage || userData.photoUrl || "https://via.placeholder.com/80",
        rank: userData.rank || "Player",
        level: userData.level || 1
      };
    }
    return USER_PROFILE;
  };

  const profileData = getProfileData();
  
  // Use the better formatted profile data for the header if user is authenticated
  const headerProfile = isAuthenticated && !isGuestUser ? profileData : null;
  
  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header
        title="Champions Arena"
        profile={headerProfile}
        onProfilePress={isAuthenticated && !isGuestUser ? toggleMenu : handleLoginPress}
      />

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
              <View style={profileStyles.profileHeaderCard}>
                <Image
                  source={{ uri: profileData.profilePicture }}
                  style={profileStyles.profileHeaderImage}
                />
                <Text style={profileStyles.profileHeaderName}>
                  {profileData.name}
                </Text>
                <Text style={profileStyles.profileHeaderUsername}>
                  {profileData.username}
                </Text>
                <View style={profileStyles.profileRankBadge}>
                  <Text style={profileStyles.profileRankText}>
                    {profileData.rank}
                  </Text>
                </View>
                <Text style={profileStyles.profileLevel}>
                  Level {profileData.level}
                </Text>
                <View style={profileStyles.statsRow}>
                  <View style={profileStyles.statItem}>
                    <Text style={profileStyles.statNumber}>24</Text>
                    <Text style={profileStyles.statLabel}>Tournaments</Text>
                  </View>
                  <View style={profileStyles.statDivider} />
                  <View style={profileStyles.statItem}>
                    <Text style={profileStyles.statNumber}>156</Text>
                    <Text style={profileStyles.statLabel}>Matches</Text>
                  </View>
                  <View style={profileStyles.statDivider} />
                  <View style={profileStyles.statItem}>
                    <Text style={profileStyles.statNumber}>8</Text>
                    <Text style={profileStyles.statLabel}>Teams</Text>
                  </View>
                </View>
              </View>

              <View style={globalStyles.card}>
                <Text style={profileStyles.sectionCardTitle}>Achievements</Text>
                <View style={profileStyles.achievementRow}>
                  <View style={profileStyles.achievement}>
                    <View style={profileStyles.achievementIcon}>
                      <Ionicons
                        name="trophy"
                        size={24}
                        color={colors.status.gold}
                      />
                    </View>
                    <Text style={profileStyles.achievementText}>
                      Tournament Winner
                    </Text>
                  </View>
                  <View style={profileStyles.achievement}>
                    <View style={profileStyles.achievementIcon}>
                      <Ionicons name="star" size={24} color={colors.primary} />
                    </View>
                    <Text style={profileStyles.achievementText}>Top Player</Text>
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
                  <View key={item} style={profileStyles.matchHistoryItem}>
                    <View
                      style={[
                        profileStyles.matchResultIndicator,
                        {
                          backgroundColor:
                            item % 2 === 0
                              ? colors.status.danger
                              : colors.status.success,
                        },
                      ]}
                    />
                    <View style={profileStyles.matchHistoryContent}>
                      <Text style={profileStyles.matchHistoryTitle}>
                        {item % 2 === 0
                          ? "Lost to Team Alpha"
                          : "Won against Team Beta"}
                      </Text>
                      <Text style={profileStyles.matchHistoryDetails}>
                        Free Fire MAX • {item} days ago
                      </Text>
                    </View>
                    <Text style={profileStyles.matchHistoryScore}>
                      {item % 2 === 0 ? "2 - 3" : "3 - 1"}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            // Show login prompt for both guest users and unauthenticated users
            renderLoginPrompt()
          )}

          {/* Guest user banner if user is a guest */}
          {isGuestUser && (
            <View style={styles.guestBanner}>
              <Ionicons name="information-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.guestBannerText}>
                You're browsing as a guest. Some features are limited.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Add new styles for login prompt and guest user
const styles = StyleSheet.create({
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  loginIcon: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
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
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 15,
    color: colors.text.primary,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 132, 195, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 16,
  },
  guestBannerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
});

export default ProfileScreen;
