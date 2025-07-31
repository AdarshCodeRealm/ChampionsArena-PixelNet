import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles, colors } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import tournamentService from '../../services/tournamentService';

const TournamentDetailsScreen = ({ route, navigation }) => {
  const { tournament: initialTournament } = route.params;
  const { userData, userToken } = useAuth();
  
  const [tournament, setTournament] = useState(initialTournament);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [teamData, setTeamData] = useState({
    teamName: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    members: [''] // Start with one member field
  });
  const [selectedTab, setSelectedTab] = useState('details');

  useEffect(() => {
    if (userToken) {
      // Set token for tournament service AND setup global axios defaults
      tournamentService.setAuthToken(userToken);
      
      // Also set global axios defaults to ensure consistency
      import('axios').then((axios) => {
        axios.default.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      });
      
      fetchTournamentDetails();
    }
  }, [userToken]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const response = await tournamentService.getTournamentById(tournament._id || tournament.id);
      if (response && response.data) {
        setTournament(response.data);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequiredTeamSize = () => {
    switch (tournament.teamSize) {
      case 'solo': return 1;
      case 'duo': return 2;
      case 'trio': return 3;
      case 'squad': return 4;
      case 'other': return tournament.customTeamSize || 1;
      default: return 1;
    }
  };

  const addMemberField = () => {
    const requiredSize = getRequiredTeamSize();
    if (teamData.members.length < requiredSize) {
      setTeamData(prev => ({
        ...prev,
        members: [...prev.members, '']
      }));
    }
  };

  const removeMemberField = (index) => {
    if (teamData.members.length > 1) {
      setTeamData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMember = (index, value) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => i === index ? value : member)
    }));
  };

  const validateRegistration = () => {
    if (!teamData.teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return false;
    }

    if (!teamData.captainName.trim()) {
      Alert.alert('Error', 'Please enter captain name');
      return false;
    }

    if (!teamData.captainEmail.trim()) {
      Alert.alert('Error', 'Please enter captain email');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teamData.captainEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!teamData.captainPhone.trim()) {
      Alert.alert('Error', 'Please enter captain phone number');
      return false;
    }

    // Validate phone number (basic validation for 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(teamData.captainPhone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    const requiredSize = getRequiredTeamSize();
    const filledMembers = teamData.members.filter(member => member.trim());
    
    if (filledMembers.length < requiredSize) {
      Alert.alert('Error', `This tournament requires exactly ${requiredSize} players. You have only provided ${filledMembers.length} player names.`);
      return false;
    }

    // Check for duplicate member names
    const memberNames = filledMembers.map(name => name.trim().toLowerCase());
    const uniqueNames = [...new Set(memberNames)];
    if (memberNames.length !== uniqueNames.length) {
      Alert.alert('Error', 'Player names must be unique. Please check for duplicates.');
      return false;
    }

    // Check if user is authenticated
    if (!userToken || !userData) {
      Alert.alert('Authentication Required', 'Please log in to register for tournaments');
      return false;
    }

    return true;
  };

  const handleRegistration = async () => {
    if (!validateRegistration()) return;

    try {
      setRegistering(true);
      
      // For free tournaments, register directly
      if (!tournament.entryFee || tournament.entryFee === 0) {
        await registerTeamDirectly();
        return;
      }

      // For paid tournaments, initiate payment first
      await initiatePayment();
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed');
      setRegistering(false);
    }
  };

  const registerTeamDirectly = async () => {
    try {
      const registrationData = {
        tournamentId: tournament._id || tournament.id,
        teamName: teamData.teamName.trim(),
        captainName: teamData.captainName.trim(),
        captainEmail: teamData.captainEmail.trim(),
        captainPhone: teamData.captainPhone.trim(),
        members: teamData.members.filter(member => member.trim()).map(name => ({ name: name.trim() })),
        paymentStatus: 'completed', // For free tournaments
        paymentMethod: 'none'
      };

      const response = await tournamentService.registerForTournament(registrationData);
      
      if (response && response.success) {
        Alert.alert('Success', 'Successfully registered for the tournament!', [
          {
            text: 'OK',
            onPress: () => {
              setShowRegistrationModal(false);
              setRegistering(false);
              fetchTournamentDetails(); // Refresh tournament data
            }
          }
        ]);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setRegistering(false);
      throw error;
    }
  };

  const initiatePayment = async () => {
    try {
      const paymentData = {
        name: teamData.captainName.trim(),
        mobileNumber: teamData.captainPhone.trim(),
        amount: tournament.entryFee,
        description: `Registration fee for ${tournament.title || tournament.name}`,
        userId: userData?._id || userData?.id
      };

      console.log('Initiating payment with data:', paymentData);
      
      const paymentResponse = await tournamentService.processPayment(paymentData);
      
      if (paymentResponse && paymentResponse.success && paymentResponse.data.paymentUrl) {
        // Store team data for retrieval after payment
        const teamRegistrationData = {
          tournamentId: tournament._id || tournament.id,
          teamName: teamData.teamName.trim(),
          captainName: teamData.captainName.trim(),
          captainEmail: teamData.captainEmail.trim(),
          captainPhone: teamData.captainPhone.trim(),
          members: teamData.members.filter(member => member.trim()).map(name => ({ name: name.trim() })),
          transactionId: paymentResponse.data.transactionId,
          paymentMethod: 'phonepe'
        };

        // Store data globally for retrieval after payment
        global.pendingRegistration = teamRegistrationData;
        
        // Open payment URL
        const supported = await Linking.canOpenURL(paymentResponse.data.paymentUrl);
        if (supported) {
          await Linking.openURL(paymentResponse.data.paymentUrl);
          
          // Close modal and show payment in progress message
          setShowRegistrationModal(false);
          setRegistering(false);
          
          Alert.alert(
            'Payment Initiated', 
            'Payment window has been opened. Please complete the payment and return to the app.',
            [
              {
                text: 'Check Payment Status',
                onPress: () => checkPaymentAndRegister(paymentResponse.data.transactionId)
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setRegistering(false)
              }
            ]
          );
        } else {
          throw new Error('Cannot open payment URL');
        }
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      setRegistering(false);
      throw error;
    }
  };

  const checkPaymentAndRegister = async (transactionId) => {
    try {
      setRegistering(true);
      
      // Check payment status
      const statusResponse = await tournamentService.checkPaymentStatus(transactionId);
      
      if (statusResponse && statusResponse.success && statusResponse.data.status === 'SUCCESS') {
        // Payment successful, now register the team
        const registrationData = global.pendingRegistration;
        if (registrationData) {
          registrationData.paymentStatus = 'completed';
          registrationData.paymentDetails = transactionId;
          
          const response = await tournamentService.registerForTournament(registrationData);
          
          if (response && response.success) {
            // Clear pending data
            global.pendingRegistration = null;
            
            Alert.alert('Success', 'Payment successful! Your team has been registered for the tournament.', [
              {
                text: 'OK',
                onPress: () => {
                  setRegistering(false);
                  fetchTournamentDetails(); // Refresh tournament data
                }
              }
            ]);
          } else {
            throw new Error('Payment successful but team registration failed. Please contact support.');
          }
        } else {
          throw new Error('Registration data not found. Please try again.');
        }
      } else {
        Alert.alert('Payment Status', 'Payment is still pending or failed. Please check again later.', [
          {
            text: 'Check Again',
            onPress: () => checkPaymentAndRegister(transactionId)
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setRegistering(false)
          }
        ]);
      }
    } catch (error) {
      setRegistering(false);
      console.error('Payment verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify payment status');
    }
  };

  const shareTourtmament = async () => {
    try {
      await Share.share({
        message: `Check out this tournament: ${tournament.title || tournament.name}\nGame: ${tournament.game}\nPrize: ₹${tournament.prizePool || tournament.prize}`,
        title: tournament.title || tournament.name
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    console.log('Registration check:', {
      tournamentStatus: tournament.status,
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      isBeforeStart: now < startDate,
      isOpen: tournament.status === 'open'
    });
    return tournament.status === 'open' && now < startDate;
  };

  const canRegister = () => {
    const registrationOpen = isRegistrationOpen();
    const spotsAvailable = (tournament.registeredTeams?.length || 0) < tournament.maxTeams;
    const userExists = !!userData;
    
    console.log('Can register check:', {
      registrationOpen,
      spotsAvailable,
      userExists,
      registeredTeams: tournament.registeredTeams?.length || 0,
      maxTeams: tournament.maxTeams,
      userData: userData
    });
    
    return registrationOpen && spotsAvailable && userExists;
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'details':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Tournament Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="game-controller-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Game:</Text>
                <Text style={styles.infoValue}>{tournament.game}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(tournament.startDate)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>{formatTime(tournament.startDate)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Team Size:</Text>
                <Text style={styles.infoValue}>{tournament.teamSize}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Prize Pool:</Text>
                <Text style={styles.infoValue}>₹{tournament.prizePool || tournament.prize || '0'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Entry Fee:</Text>
                <Text style={styles.infoValue}>₹{tournament.entryFee || '0'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="flag-outline" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Max Teams:</Text>
                <Text style={styles.infoValue}>{tournament.maxTeams}</Text>
              </View>
            </View>

            {tournament.description && (
              <>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionText}>{tournament.description}</Text>
                </View>
              </>
            )}

            {tournament.rules && (
              <>
                <Text style={styles.sectionTitle}>Rules</Text>
                <View style={styles.rulesCard}>
                  <Text style={styles.rulesText}>{tournament.rules}</Text>
                </View>
              </>
            )}
          </View>
        );
      
      case 'teams':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Registered Teams</Text>
            <Text style={styles.teamsCount}>
              {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} teams registered
            </Text>
            
            {tournament.registeredTeams && tournament.registeredTeams.length > 0 ? (
              tournament.registeredTeams.map((team, index) => (
                <View key={team._id || index} style={styles.teamCard}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamCaptain}>Captain: {team.captain?.name || 'Unknown'}</Text>
                  <Text style={styles.teamMembers}>
                    Members: {team.members?.length || team.teamMembers?.length || 0}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={50} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No teams registered yet</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={shareTourtmament}>
          <Ionicons name="share-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Tournament Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ 
              uri: tournament.bannerImage || 'https://i.pinimg.com/736x/41/b9/ee/41b9eed394ab758224d56518d4b2d41a.jpg'
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{tournament.status}</Text>
            </View>
            <Text style={styles.tournamentTitle}>{tournament.title || tournament.name}</Text>
            <Text style={styles.organizerText}>
              by {tournament.organizerName || tournament.organizer?.name || 'Organizer'}
            </Text>
          </View>
        </View>

        {/* Registration Status */}
        <View style={styles.registrationStatus}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${((tournament.registeredTeams?.length || 0) / tournament.maxTeams) * 100}%`
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {tournament.registeredTeams?.length || 0} / {tournament.maxTeams} teams registered
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'details' && styles.activeTab]}
            onPress={() => setSelectedTab('details')}
          >
            <Text style={[styles.tabText, selectedTab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'teams' && styles.activeTab]}
            onPress={() => setSelectedTab('teams')}
          >
            <Text style={[styles.tabText, selectedTab === 'teams' && styles.activeTabText]}>
              Teams
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Register Button */}
      {canRegister() && (
        <View style={styles.registerContainer}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setShowRegistrationModal(true)}
          >
            <Text style={styles.registerButtonText}>
              Register Team • ₹{tournament.entryFee || '0'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Register Button - Always Show for Testing */}
      {!canRegister() && (
        <View style={styles.registerContainer}>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.status.warning }]}
            onPress={() => setShowRegistrationModal(true)}
          >
            <Text style={styles.registerButtonText}>
              Register Team • ₹{tournament.entryFee || '0'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.progressText, { marginTop: 8, fontSize: 12 }]}>
            Debug: Registration conditions not met - Check console logs
          </Text>
        </View>
      )}

      {/* Registration Modal */}
      <Modal
        visible={showRegistrationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Register Team</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.formLabel}>Team Name *</Text>
            <TextInput
              style={styles.textInput}
              value={teamData.teamName}
              onChangeText={(text) => setTeamData(prev => ({ ...prev, teamName: text }))}
              placeholder="Enter team name"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.formLabel}>Captain Name *</Text>
            <TextInput
              style={styles.textInput}
              value={teamData.captainName}
              onChangeText={(text) => setTeamData(prev => ({ ...prev, captainName: text }))}
              placeholder="Enter captain name"
              placeholderTextColor={colors.text.secondary}
            />

            <Text style={styles.formLabel}>Captain Email *</Text>
            <TextInput
              style={styles.textInput}
              value={teamData.captainEmail}
              onChangeText={(text) => setTeamData(prev => ({ ...prev, captainEmail: text }))}
              placeholder="Enter captain email"
              placeholderTextColor={colors.text.secondary}
              keyboardType="email-address"
            />

            <Text style={styles.formLabel}>Captain Phone *</Text>
            <TextInput
              style={styles.textInput}
              value={teamData.captainPhone}
              onChangeText={(text) => setTeamData(prev => ({ ...prev, captainPhone: text }))}
              placeholder="Enter captain phone number"
              placeholderTextColor={colors.text.secondary}
              keyboardType="phone-pad"
            />

            <Text style={styles.formLabel}>
              Team Members * ({getRequiredTeamSize()} required)
            </Text>
            
            {teamData.members.map((member, index) => (
              <View key={index} style={styles.memberRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={member}
                  onChangeText={(text) => updateMember(index, text)}
                  placeholder={`Player ${index + 1} name`}
                  placeholderTextColor={colors.text.secondary}
                />
                {teamData.members.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => removeMemberField(index)}
                  >
                    <Ionicons name="close" size={20} color={colors.status.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {teamData.members.length < getRequiredTeamSize() && (
              <TouchableOpacity style={styles.addMemberButton} onPress={addMemberField}>
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addMemberText}>Add Player</Text>
              </TouchableOpacity>
            )}

            <View style={styles.feeInfo}>
              <Text style={styles.feeLabel}>Entry Fee:</Text>
              <Text style={styles.feeAmount}>₹{tournament.entryFee || '0'}</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, registering && styles.disabledButton]}
              onPress={handleRegistration}
              disabled={registering}
            >
              {registering ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {tournament.entryFee > 0 ? 'Register & Pay' : 'Register Team'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  tournamentTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  organizerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  registrationStatus: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  rulesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rulesText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  teamsCount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  teamCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  teamCaptain: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  teamMembers: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
  },
  registerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeMemberButton: {
    padding: 8,
    marginLeft: 8,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addMemberText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  feeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  feeLabel: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  feeAmount: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default TournamentDetailsScreen;