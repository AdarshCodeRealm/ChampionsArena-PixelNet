import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../ui/Header";
import SectionHeader from "../ui/SectionHeader";
import MatchCard from "../ui/MatchCard";
import MatchModal from "../ui/MatchModal";
import { globalStyles, colors } from "../../styles/globalStyles";
import { 
  DEFAULT_FORM_DATA, 
  validateMatchForm
} from "../../utils/matchUtils";
import { useAuth } from "../../contexts/AuthContext";
import tournamentService from "../../services/tournamentService";

const ManageMatchesScreen = ({ navigation }) => {
  const { userData, userToken } = useAuth();
  const [matches, setMatches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentBannerImage, setCurrentBannerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  // Set the auth token for API requests
  useEffect(() => {
    if (userToken) {
      tournamentService.setAuthToken(userToken);
    }
  }, [userToken]);

  // Check if user is authorized to access this screen
  useEffect(() => {
    if (!userData || userData.userType !== 'organizer') {
      Alert.alert(
        "Access Denied",
        "Only organizers can access this screen.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (!userData.isApproved) {
      Alert.alert(
        "Account Pending Approval",
        "Your organizer account is pending approval. You'll be able to manage matches once approved.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    // Fetch matches data
    fetchMatches();
  }, [userData]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // Get all tournaments sorted by newest first
      const allTournamentsData = await tournamentService.getAllTournaments({
        sort: 'updatedAt',
        order: 'desc'
      });
      
      if (allTournamentsData && allTournamentsData.data) {
        setMatches(allTournamentsData.data);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      Alert.alert("Error", error.message || "Failed to load tournaments.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleCreateMatch = async (formData, bannerImage) => {
    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert banner image to upload format if provided
      const imageFile = bannerImage ? {
        uri: bannerImage.uri,
        type: bannerImage.type || 'image/jpeg',
        name: bannerImage.fileName || 'tournament_banner.jpg'
      } : null;
      
      // Create tournament via API
      const newTournament = await tournamentService.createTournament(formData, imageFile);
      console.log("match hadle create click")
      
      // Update matches list with new tournament
      if (newTournament) {
        setMatches(prev => [newTournament, ...prev]);
        setModalVisible(false);
        resetFormData();
        Alert.alert("Success", "Tournament created successfully!");
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      Alert.alert("Error", error.message || "Failed to create tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMatch = async (formData, bannerImage) => {
    if (!currentMatch) return;

    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert banner image to upload format if provided
      const imageFile = bannerImage && bannerImage.uri !== currentMatch.bannerImage ? {
        uri: bannerImage.uri,
        type: bannerImage.type || 'image/jpeg',
        name: bannerImage.fileName || 'tournament_banner.jpg'
      } : null;
      
      // Update tournament via API
      const updatedTournament = await tournamentService.updateTournament(
        currentMatch.id, 
        formData, 
        imageFile
      );
      
      // Update matches list with updated tournament
      if (updatedTournament) {
        setMatches(prev => prev.map(match => 
          match.id === updatedTournament.id ? updatedTournament : match
        ));
        setEditModalVisible(false);
        setCurrentMatch(null);
        setCurrentBannerImage(null);
        resetFormData();
        Alert.alert("Success", "Tournament updated successfully!");
      }
    } catch (error) {
      console.error("Error updating tournament:", error);
      Alert.alert("Error", error.message || "Failed to update tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    Alert.alert(
      "Delete Tournament",
      "Are you sure you want to delete this tournament? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Delete tournament via API
              const success = await tournamentService.deleteTournament(id);
              
              if (success) {
                // Remove tournament from list
                setMatches(prev => prev.filter(match => match.id !== id));
                Alert.alert("Success", "Tournament deleted successfully!");
              }
            } catch (error) {
              console.error("Error deleting tournament:", error);
              Alert.alert("Error", error.message || "Failed to delete tournament. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const openEditModal = (match) => {
    // Ensure organizer can only edit their own matches
    if (match.createdBy !== userData?._id) {
      Alert.alert("Error", "You can only edit tournaments you created.");
      return;
    }

    setCurrentMatch(match);
    
    // Prepare form data from match
    setFormData({
      title: match.title,
      description: match.description || "",
      game: match.game,
      date: match.date,
      time: match.time,
      prizePool: match.prizePool,
      teamSize: match.teamSize.toString(),
      maxTeams: match.maxTeams.toString(),
    });
    
    // Prepare banner image for edit if one exists
    if (match.bannerImage) {
      setCurrentBannerImage({
        uri: match.bannerImage,
        type: 'image/jpeg',
        fileName: 'current_banner.jpg'
      });
    }
    
    setEditModalVisible(true);
  };

  // Check if a match is owned by the current organizer
  const isOwnedByCurrentOrganizer = (match) => {
    return match.createdBy === userData?._id;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <Header title="Manage Matches" onBackPress={() => navigation.goBack()} />
        <View style={[globalStyles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header title="Manage Matches" onBackPress={() => navigation.goBack()} />

      <ScrollView style={globalStyles.container}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => {
              resetFormData();
              setModalVisible(true);
            }}
            disabled={isSubmitting}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.createButtonText}>Create New Tournament</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="My Tournaments" />
        {matches
          .filter(match => isOwnedByCurrentOrganizer(match))
          .map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onEdit={() => openEditModal(match)} 
              onDelete={() => handleDeleteMatch(match.id)} 
              isEditable={true}
            />
          ))
        }
        {matches.filter(match => isOwnedByCurrentOrganizer(match)).length === 0 && (
          <Text style={styles.emptyListText}>
            You haven't created any tournaments yet. Click the button above to create your first tournament.
          </Text>
        )}

        <SectionHeader title="Other Organizers' Tournaments" />
        {matches
          .filter(match => !isOwnedByCurrentOrganizer(match))
          .map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              isEditable={false}
            />
          ))
        }
        {matches.filter(match => !isOwnedByCurrentOrganizer(match)).length === 0 && (
          <Text style={styles.emptyListText}>
            No tournaments from other organizers found.
          </Text>
        )}
      </ScrollView>

      {/* Create Match Modal */}
      <MatchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateMatch}
        isEditMode={false}
      />

      {/* Edit Match Modal */}
      <MatchModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateMatch}
        isEditMode={true}
        initialBannerImage={currentBannerImage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: 16,
    marginTop: 15,
  },
  emptyListText: {
    color: colors.text.secondary,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  }
});

export default ManageMatchesScreen; 