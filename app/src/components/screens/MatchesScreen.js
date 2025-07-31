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
      console.log('Fetching tournaments from API...');
      const tournamentsData = await tournamentService.getAllTournaments({
        sort: 'createdAt',
        order: 'desc',
        limit: 50
      });

      console.log('Tournaments API response:', tournamentsData);

      // Handle the correct API response structure
      if (tournamentsData && tournamentsData.data && Array.isArray(tournamentsData.data)) {
        setTournaments(tournamentsData.data);
        console.log(`Loaded ${tournamentsData.data.length} tournaments from API`);
      } else if (tournamentsData && tournamentsData.tournaments && Array.isArray(tournamentsData.tournaments)) {
        // Fallback for different response structure
        setTournaments(tournamentsData.tournaments);
        console.log(`Loaded ${tournamentsData.tournaments.length} tournaments from API`);
      } else if (tournamentsData && Array.isArray(tournamentsData)) {
        // Direct array response
        setTournaments(tournamentsData);
        console.log(`Loaded ${tournamentsData.length} tournaments from API`);
      } else {
        console.log('No valid tournament data received from API');
        setTournaments([]);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError(`Failed to load tournaments: ${error.message}`);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled tournaments from API - for now just using mock data
  const fetchEnrolledTournaments = async () => {
    // TODO: Implement API call for enrolled tournaments when endpoint is available
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
    console.log('Debug: register team 200'); // This is the debug message you're seeing
    
    // Navigate to tournament details screen where registration is handled
    navigation.navigate('TournamentDetails', { tournament });
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
            <TouchableOpacity 
              onPress={fetchTournaments}
              style={{ marginTop: 5, padding: 5 }}
            >
              <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Tap to retry</Text>
            </TouchableOpacity>
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
                  key={tournament._id || tournament.id}
                  tournament={tournament}
                  onPress={handleTournamentPress}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="calendar-outline" size={50} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, marginTop: 10, textAlign: 'center' }}>
                  {error ? 'Failed to load tournaments.' : 'No tournaments available right now.'}
                </Text>
                {error && (
                  <TouchableOpacity 
                    onPress={fetchTournaments}
                    style={{ marginTop: 10, padding: 10, backgroundColor: colors.primary, borderRadius: 5 }}
                  >
                    <Text style={{ color: 'white' }}>Retry</Text>
                  </TouchableOpacity>
                )}
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