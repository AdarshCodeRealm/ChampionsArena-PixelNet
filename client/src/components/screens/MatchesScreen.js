import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../ui/Header';
import TabBar from '../ui/TabBar';
import SectionHeader from '../ui/SectionHeader';
import TournamentCard from '../ui/TournamentCard';
import { globalStyles, tournamentStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/globalStyles';

// API Base URL - replace with your actual server IP when testing
const API_BASE_URL = 'https://localhost:8000/api/v1'; // Use 10.0.2.2 for Android emulator

// Mock data for fallback
const FALLBACK_TOURNAMENTS = [
  { 
    id: '1', 
    name: 'Free Fire Summer Championship', 
    game: 'Free Fire MAX',
    prize: '$1,000', 
    date: 'June 15, 2023',
    registeredTeams: 28,
    bannerImage:'https://i.pinimg.com/474x/a6/ee/c4/a6eec4a2cd7d3afcd9a9dfd9f87dc533.jpg',
    maxTeams: 32,
    status: 'upcoming',
  },
  { 
    id: '2', 
    name: 'Free Fire Winter League', 
    game: 'Free Fire MAX',
    prize: '$500', 
    date: 'December 5, 2023',
    registeredTeams: 12,
    maxTeams: 16,
    status: 'upcoming',
  },
  { 
    id: '3', 
    name: 'Free Fire Spring Tournament', 
    game: 'Free Fire MAX',
    prize: '$750', 
    date: 'March 10, 2023',
    registeredTeams: 24,
    bannerImage:'https://i.pinimg.com/474x/a6/ee/c4/a6eec4a2cd7d3afcd9a9dfd9f87dc533.jpg',
    maxTeams: 24,
    status: 'completed',
  },
];

const FALLBACK_ENROLLED_TOURNAMENTS = [
  { 
    id: '1', 
    name: 'Free Fire Pro League', 
    game: 'Free Fire MAX',
    date: 'June 18, 2023',
    time: '8:00 PM',
    status: 'Confirmed',
  },
  { 
    id: '2', 
    name: 'Season Qualifiers', 
    game: 'Free Fire MAX',
    date: 'June 25, 2023',
    time: '7:30 PM',
    status: 'Pending',
  }
];

const USER_PROFILE = {
  name: "John Doe",
  username: "@johndoe",
  avatar: "https://via.placeholder.com/80",
  rank: "Diamond III",
  level: 52
};

const MatchesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [enrolledTournaments, setEnrolledTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tabs = [
    { id: 'tournaments', label: 'TOURNAMENTS' },
    { id: 'enrolled', label: 'MY ENROLLMENTS' }
  ];

  // Fetch tournaments from API
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // For mobile apps, localhost won't work as it refers to the device itself
      // Use your computer's IP address or a deployed backend URL
      const response = await fetch('http://192.168.65.119:8000/api/v1/tournaments');
      // 10.0.2.2 is the special IP for Android emulator to reach host machine
      // For iOS simulator, use localhost or 127.0.0.1
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setTournaments(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch tournaments');
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError('Failed to load tournaments. Using fallback data.');
      // Use fallback data if API fails
      setTournaments(FALLBACK_TOURNAMENTS);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled tournaments from API
  const fetchEnrolledTournaments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/enrolled`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        setEnrolledTournaments(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch enrolled tournaments');
      }
    } catch (error) {
      console.error('Error fetching enrolled tournaments:', error);
      setError('Failed to load enrolled tournaments. Using fallback data.');
      // Use fallback data if API fails
      setEnrolledTournaments(FALLBACK_ENROLLED_TOURNAMENTS);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchTournaments();
    fetchEnrolledTournaments();
  }, []);

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const handleTournamentPress = (tournament) => {
    console.log('Tournament pressed:', tournament);
    // Navigate to tournament details
  };

  const handleTeamDetailsPress = (tournament) => {
    console.log('Team details pressed:', tournament);
    // Navigate to team details
  };

  const handleCancelRegistration = (tournament) => {
    console.log('Cancel registration pressed:', tournament);
    // Show confirmation dialog
  };

  const handleBrowseTournaments = () => {
    setActiveTab('tournaments');
  };

  // Render loading indicator
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <Header 
          title="Champions PixelNet"
          profile={USER_PROFILE}
          onProfilePress={() => navigation.navigate('Profile')}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text.primary, marginTop: 10 }}>Loading tournaments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header 
        title="Champions PixelNet"
        profile={USER_PROFILE}
        onProfilePress={() => navigation.navigate('Profile')}
      />
      
      <TabBar 
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      
      <ScrollView style={globalStyles.container}>
        {/* Show error message if there was an error */}
        {error && (
          <View style={{ padding: 10, backgroundColor: 'rgba(255, 0, 0, 0.1)', marginBottom: 10, borderRadius: 5 }}>
            <Text style={{ color: colors.status.danger }}>{error}</Text>
          </View>
        )}
        
        {activeTab === 'tournaments' ? (
          <>
            <SectionHeader 
              title="All Tournaments" 
              showViewAll={true}
              viewAllText="Filter"
              onViewAllPress={() => console.log('Filter pressed')}
            />
            <Text style={globalStyles.subtitleText}>Browse and register for tournaments</Text>
            
            {tournaments.map((tournament) => (
              <TournamentCard 
                key={tournament.id}
                tournament={tournament}
                onPress={handleTournamentPress}
              />
            ))}
          </>
        ) : (
          <>
            <SectionHeader title="My Enrolled Tournaments" />
            
            {Array.isArray(enrolledTournaments) && enrolledTournaments.length > 0 ? (
              enrolledTournaments.map((tournament) => (
                <TouchableOpacity 
                  key={tournament.id} 
                  style={tournamentStyles.enrolledCard}
                  onPress={() => handleTournamentPress(tournament)}
                >
                  <View style={tournamentStyles.enrolledHeader}>
                    <Text style={tournamentStyles.enrolledName}>{tournament.name}</Text>
                    <View style={[tournamentStyles.statusBadge, { 
                      backgroundColor: tournament.status === 'Confirmed' ? colors.status.success : colors.status.warning
                    }]}>
                      <Text style={tournamentStyles.statusText}>{tournament.status}</Text>
                    </View>
                  </View>
                  <Text style={tournamentStyles.tournamentGame}>{tournament.game}</Text>
                  <View style={tournamentStyles.tournamentDetails}>
                    <View style={tournamentStyles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                      <Text style={tournamentStyles.detailText}>{tournament.date}</Text>
                    </View>
                    <View style={tournamentStyles.detailItem}>
                      <Ionicons name="time-outline" size={16} color={colors.primary} />
                      <Text style={tournamentStyles.detailText}>{tournament.time}</Text>
                    </View>
                  </View>
                  <View style={tournamentStyles.buttonRow}>
                    <TouchableOpacity 
                      style={tournamentStyles.detailButton}
                      onPress={() => handleTeamDetailsPress(tournament)}
                    >
                      <Text style={tournamentStyles.detailButtonText}>Team Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={tournamentStyles.cancelButton}
                      onPress={() => handleCancelRegistration(tournament)}
                    >
                      <Text style={tournamentStyles.cancelButtonText}>Cancel Registration</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={globalStyles.emptyStateContainer}>
                <Ionicons 
                  name="trophy-outline" 
                  size={80} 
                  color={colors.primary} 
                  style={{ marginBottom: 16, opacity: 0.7 }}
                />
                <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
                  You haven't enrolled in any tournaments yet
                </Text>
                <TouchableOpacity 
                  style={[globalStyles.primaryButton, { marginTop: 20, width: 200 }]}
                  onPress={handleBrowseTournaments}
                >
                  <Text style={globalStyles.primaryButtonText}>Browse Tournaments</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};  

export default MatchesScreen; 