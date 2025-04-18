import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../ui/Header';
import SectionHeader from '../ui/SectionHeader';
import { globalStyles, profileStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/globalStyles';

// Mock data directly in ProfileScreen
const USER_PROFILE = {
  name: "John Doe",
  username: "@johndoe",
  avatar: "https://via.placeholder.com/80",
  rank: "Diamond III",
  level: 52
};

const MENU_ITEMS = [
  { id: '1', title: 'Premium Plans', icon: 'crown' },
  { id: '2', title: 'Creator Profile', icon: 'person' },
  { id: '3', title: 'Manage Communities', icon: 'shield' },
  { id: '4', title: 'Manage Teams', icon: 'people' },
  { id: '5', title: 'Giveaways', icon: 'gift' },
  { id: '6', title: 'Claim Gift Card', icon: 'card' },
  { id: '7', title: 'Store', icon: 'storefront' },
  { id: '8', title: 'Offers Wall', icon: 'cash' },
  { id: '9', title: 'Convert Play Balance', icon: 'wallet' },
  { id: '10', title: 'Game Zone', icon: 'game-controller' },
  { id: '11', title: 'Leaderboard', icon: 'stats-chart', isNew: true },
];

const ProfileScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = (item) => {
    console.log('Menu item pressed:', item);
    // Navigate to the selected menu item
  };

  const handleViewAllPress = () => {
    console.log('View all matches pressed');
    // Navigate to matches history
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header 
        title="Champions PixelNet"
        profile={USER_PROFILE}
        onProfilePress={toggleMenu}
      />
      
      {menuVisible ? (
        <ScrollView style={profileStyles.menuContainer}>
          <View style={profileStyles.profileSection}>
            <Image 
              source={{ uri: USER_PROFILE.avatar }} 
              style={profileStyles.profileImage} 
            />
            <View style={profileStyles.profileInfo}>
              <Text style={[profileStyles.menuItemText, { marginBottom: 5 }]}>
                {USER_PROFILE.name}
              </Text>
              <Text style={profileStyles.profileUsername}>
                {USER_PROFILE.username}
              </Text>
            </View>
          </View>
          
          {MENU_ITEMS.map((item) => (
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
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={globalStyles.container}>
          <View style={profileStyles.profileHeaderCard}>
            <Image 
              source={{ uri: USER_PROFILE.avatar }} 
              style={profileStyles.profileHeaderImage} 
            />
            <Text style={profileStyles.profileHeaderName}>{USER_PROFILE.name}</Text>
            <Text style={profileStyles.profileHeaderUsername}>{USER_PROFILE.username}</Text>
            <View style={profileStyles.profileRankBadge}>
              <Text style={profileStyles.profileRankText}>{USER_PROFILE.rank}</Text>
            </View>
            <Text style={profileStyles.profileLevel}>Level {USER_PROFILE.level}</Text>
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
                  <Ionicons name="trophy" size={24} color={colors.status.gold} />
                </View>
                <Text style={profileStyles.achievementText}>Tournament Winner</Text>
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
                <View style={[
                  profileStyles.matchResultIndicator, 
                  { backgroundColor: item % 2 === 0 ? colors.status.danger : colors.status.success }
                ]} />
                <View style={profileStyles.matchHistoryContent}>
                  <Text style={profileStyles.matchHistoryTitle}>
                    {item % 2 === 0 ? 'Lost to Team Alpha' : 'Won against Team Beta'}
                  </Text>
                  <Text style={profileStyles.matchHistoryDetails}>
                    Free Fire MAX • {item} days ago
                  </Text>
                </View>
                <Text style={profileStyles.matchHistoryScore}>
                  {item % 2 === 0 ? '2 - 3' : '3 - 1'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen; 