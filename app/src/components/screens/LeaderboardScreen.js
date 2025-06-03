import React, { useState } from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../ui/Header';
import TabBar from '../ui/TabBar';
import { globalStyles, playerStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

// Mock data directly in LeaderboardScreen
const USER_PROFILE = {
  name: "John Doe",
  username: "@johndoe",
  avatar: "https://via.placeholder.com/80",
  rank: "Diamond III",
  level: 52
};

// Leaderboard data for Solo, Duo and Squad
const LEADERBOARD_DATA = {
  solo: [
    { id: '1', name: 'Alex Johnson', rank: 1, kills: 342, wins: 42, avatar: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Maria Garcia', rank: 2, kills: 315, wins: 39, avatar: 'https://via.placeholder.com/50' },
    { id: '3', name: 'James Wilson', rank: 3, kills: 301, wins: 36, avatar: 'https://via.placeholder.com/50' },
    { id: '4', name: 'Sarah Lee', rank: 4, kills: 287, wins: 34, avatar: 'https://via.placeholder.com/50' },
    { id: '5', name: 'David Kim', rank: 5, kills: 265, wins: 32, avatar: 'https://via.placeholder.com/50' },
  ],
  duo: [
    { id: '1', name: 'Team Phoenix', rank: 1, kills: 562, wins: 53, members: 'Alex & James', avatar: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Dragon Slayers', rank: 2, kills: 521, wins: 48, members: 'Maria & Sarah', avatar: 'https://via.placeholder.com/50' },
    { id: '3', name: 'Shadow Warriors', rank: 3, kills: 498, wins: 45, members: 'David & Michael', avatar: 'https://via.placeholder.com/50' },
    { id: '4', name: 'Victory Duo', rank: 4, kills: 476, wins: 42, members: 'Jessica & Thomas', avatar: 'https://via.placeholder.com/50' },
    { id: '5', name: 'Elite Force', rank: 5, kills: 459, wins: 40, members: 'Robert & Emma', avatar: 'https://via.placeholder.com/50' },
  ],
  squad: [
    { id: '1', name: 'Team Alpha', rank: 1, kills: 1245, wins: 87, members: '4 members', avatar: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Immortals', rank: 2, kills: 1187, wins: 82, members: '4 members', avatar: 'https://via.placeholder.com/50' },
    { id: '3', name: 'Global Elites', rank: 3, kills: 1120, wins: 78, members: '4 members', avatar: 'https://via.placeholder.com/50' },
    { id: '4', name: 'Phoenix Rising', rank: 4, kills: 1056, wins: 75, members: '4 members', avatar: 'https://via.placeholder.com/50' },
    { id: '5', name: 'Invincible', rank: 5, kills: 982, wins: 71, members: '4 members', avatar: 'https://via.placeholder.com/50' },
  ]
};

const LeaderboardScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('solo');
  
  const tabs = [
    { id: 'solo', label: 'SOLO' },
    { id: 'duo', label: 'DUO' },
    { id: 'squad', label: 'SQUAD' }
  ];

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };
  
  const getBadgeColor = (index) => {
    switch(index) {
      case 0: return colors.status.gold;
      case 1: return colors.status.silver;
      case 2: return colors.status.bronze;
      default: return colors.primary;
    }
  };
  
  const getProfileData = () => {
    if (userData) {
      return userData;
    }
    // Fallback for testing only if no userData exists
    return {
      name: "John Doe",
      username: "@johndoe",
      avatar: "https://via.placeholder.com/80",
    };
  };
  
  const renderLeaderboardItem = (item, index) => (
    <View key={item.id} style={playerStyles.playerCard}>
      <Text style={playerStyles.playerRank}>#{item.rank}</Text>
      <Image source={{ uri: item.avatar }} style={playerStyles.playerAvatar} />
      <View style={playerStyles.playerInfo}>
        <Text style={playerStyles.playerName}>{item.name}</Text>
        <Text style={playerStyles.playerStats}>
          {activeTab === 'solo' ? 
            `${item.kills} Kills • ${item.wins} Wins` : 
            activeTab === 'duo' ? 
              `${item.members} • ${item.wins} Wins` : 
              `${item.members} • ${item.wins} Wins`
          }
        </Text>
      </View>
      <View style={[
        playerStyles.playerBadge, 
        { backgroundColor: getBadgeColor(index) }
      ]}>
        <Ionicons name={index < 3 ? 'trophy' : 'star'} size={14} color="#fff" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header 
        title="Champions Arena"
        profile={getProfileData()}
        onProfilePress={() => navigation.navigate('Profile')}
      />
      
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      <View style={playerStyles.leaderboardHeader}>
        <View style={playerStyles.leaderboardHeaderItem}>
          <Text style={playerStyles.leaderboardHeaderText}>Rank</Text>
        </View>
        <View style={[playerStyles.leaderboardHeaderItem, { flex: 2 }]}>
          <Text style={playerStyles.leaderboardHeaderText}>Player/Team</Text>
        </View>
        <View style={playerStyles.leaderboardHeaderItem}>
          <Text style={playerStyles.leaderboardHeaderText}>Wins</Text>
        </View>
      </View>
      
      <ScrollView style={globalStyles.container}>
        {LEADERBOARD_DATA[activeTab].map((item, index) => renderLeaderboardItem(item, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaderboardScreen; 