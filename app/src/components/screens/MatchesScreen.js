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
import { useAuth } from '../../contexts/AuthContext';
import tournamentService from '../../services/tournamentService';

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

const MatchesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [enrolledTournaments, setEnrolledTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { userData, userToken } = useAuth();
  
  const tabs = [
    { id: 'tournaments', label: 'TOURNAMENTS' },
    { id: 'enrolled', label: 'MY ENROLLMENTS' }
  ];

  // Set the auth token for API requests
  useEffect(() => {
    if (userToken) {
      tournamentService.setAuthToken(userToken);
    }
  }, [userToken]);

  // Fetch tournaments from API
  const fetchTournaments = async () => {
    setLoading(true);
    setError(null);
    try {
      const tournamentsData = await tournamentService.getAllTournaments({
        sort: 'updatedAt',
        order: 'desc',
        limit: 20
      });

      if (tournamentsData && tournamentsData.tournaments) {
        // Use the actual API response structure
        setTournaments(tournamentsData.tournaments);
      } else if (tournamentsData && Array.isArray(tournamentsData)) {
        // If the response is directly an array
        setTournaments(tournamentsData);
      } else {
        // Fallback to mock data if API fails
        console.log('No tournaments from API, using fallback data');
        setTournaments(FALLBACK_TOURNAMENTS);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError(`Failed to load tournaments: ${error.message}`);
      // Use fallback data when API fails
      setTournaments(FALLBACK_TOURNAMENTS);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled tournaments from API - for now just using mock data
  const fetchEnrolledTournaments = async () => {
    // In a real implementation, this would call an API endpoint for enrolled tournaments
    setEnrolledTournaments(FALLBACK_ENROLLED_TOURNAMENTS);
  };

  // Load data when component mounts
  useEffect(() => {
    fetchTournaments();
    fetchEnrolledTournaments();
  }, []);

  // Refresh data when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTournaments();
    });

    return unsubscribe;
  }, [navigation]);

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

  // Get profile data for header
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

  // Render loading indicator
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <Header 
          title="Champions Arena"
          profile={getProfileData()}
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
        title="Champions Arena"
        profile={getProfileData()}
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
            
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  tournament={tournament}
                  onPress={handleTournamentPress}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="calendar-outline" size={50} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, marginTop: 10, textAlign: 'center' }}>
                  No tournaments available right now.
                </Text>
              </View>
            )}
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
                    <Text style={tournamentStyles.enrolledTitle}>{tournament.name}</Text>
                    <View 
                      style={[
                        tournamentStyles.statusBadge,
                        { backgroundColor: tournament.status === 'Confirmed' ? colors.status.success : colors.status.warning }
                      ]}
                    >
                      <Text style={tournamentStyles.statusText}>{tournament.status}</Text>
                    </View>
                  </View>
                  
                  <View style={tournamentStyles.enrolledDetails}>
                    <View style={tournamentStyles.detailItem}>
                      <Ionicons name="game-controller-outline" size={16} color={colors.text.secondary} />
                      <Text style={tournamentStyles.detailText}>{tournament.game}</Text>
                    </View>
                    <View style={tournamentStyles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                      <Text style={tournamentStyles.detailText}>{tournament.date}</Text>
                    </View>
                    <View style={tournamentStyles.detailItem}>
                      <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                      <Text style={tournamentStyles.detailText}>{tournament.time}</Text>
                    </View>
                  </View>
                  
                  <View style={tournamentStyles.enrolledActions}>
                    <TouchableOpacity 
                      style={tournamentStyles.actionButton}
                      onPress={() => handleTeamDetailsPress(tournament)}
                    >
                      <Text style={tournamentStyles.actionButtonText}>Team Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[tournamentStyles.actionButton, tournamentStyles.cancelButton]}
                      onPress={() => handleCancelRegistration(tournament)}
                    >
                      <Text style={tournamentStyles.cancelButtonText}>Cancel Registration</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={tournamentStyles.emptyStateContainer}>
                <Ionicons name="calendar-outline" size={50} color={colors.text.secondary} />
                <Text style={tournamentStyles.emptyStateText}>
                  You haven't enrolled in any tournaments yet.
                </Text>
                <TouchableOpacity 
                  style={tournamentStyles.browseButton}
                  onPress={handleBrowseTournaments}
                >
                  <Text style={tournamentStyles.browseButtonText}>Browse Tournaments</Text>
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