import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../ui/Header";
import SectionHeader from "../ui/SectionHeader";
import MatchCard from "../ui/MatchCard";
import MatchModal from "../ui/MatchModal";
import { globalStyles, colors } from "../../styles/globalStyles";
import { 
  INITIAL_MATCHES, 
  DEFAULT_FORM_DATA, 
  validateMatchForm, 
  createMatchObject 
} from "../../utils/matchUtils";
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';
import { API_URL } from '../../config/constants';

const ManageMatchesScreen = ({ navigation }) => {
  const { userData, userToken } = useAuth();
  const [matches, setMatches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

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

    // Fetch organizer's matches
    fetchOrganizerMatches();
  }, [userData]);

  const fetchOrganizerMatches = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to get the organizer's matches
      // For now, we'll use the INITIAL_MATCHES and filter them to simulate the organizer's matches
      
      // Example API call:
      // const response = await axios.get(`${API_URL}/api/v1/tournaments/organizer`, {
      //   headers: { Authorization: `Bearer ${userToken}` }
      // });
      // setMatches(response.data.data);
      
      // Simulate API call with a delay
      setTimeout(() => {
        // Filter matches to only include those created by this organizer
        // In a real implementation, the API would only return matches for the current organizer
        const organizerMatches = INITIAL_MATCHES.map(match => ({
          ...match,
          createdBy: match.id % 2 === 0 ? userData?._id : 'another-organizer-id' // Simulated ownership
        }));
        setMatches(organizerMatches);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching matches:", error);
      Alert.alert("Error", "Failed to load matches. Please try again.");
      setIsLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleCreateMatch = async () => {
    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    try {
      // In a real implementation, this would be an API call to create a match
      // Example:
      // const response = await axios.post(`${API_URL}/api/v1/tournaments`, {
      //   ...formData,
      //   organizerId: userData._id
      // }, {
      //   headers: { Authorization: `Bearer ${userToken}` }
      // });
      
      // Simulate API call with a delay
      setTimeout(() => {
        const newMatch = createMatchObject(formData);
        // Add the organizer's ID to the match
        newMatch.createdBy = userData?._id;
        setMatches([...matches, newMatch]);
        setModalVisible(false);
        resetFormData();
        
        Alert.alert("Success", "Match created successfully!");
      }, 500);
    } catch (error) {
      console.error("Error creating match:", error);
      Alert.alert("Error", "Failed to create match. Please try again.");
    }
  };

  const handleUpdateMatch = async () => {
    if (!currentMatch) return;

    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    // Ensure organizer can only update their own matches
    if (currentMatch.createdBy !== userData?._id) {
      Alert.alert("Error", "You can only update matches that you created.");
      return;
    }

    try {
      // In a real implementation, this would be an API call to update a match
      // Example:
      // const response = await axios.put(`${API_URL}/api/v1/tournaments/${currentMatch.id}`, {
      //   ...formData
      // }, {
      //   headers: { Authorization: `Bearer ${userToken}` }
      // });
      
      // Simulate API call with a delay
      setTimeout(() => {
        const updatedMatches = matches.map(match => {
          if (match.id === currentMatch.id) {
            return {
              ...match,
              title: formData.title,
              description: formData.description || "",
              game: formData.game,
              date: formData.date,
              time: formData.time,
              prizePool: formData.prizePool,
              teamSize: parseInt(formData.teamSize),
              maxTeams: parseInt(formData.maxTeams),
            };
          }
          return match;
        });

        setMatches(updatedMatches);
        setEditModalVisible(false);
        setCurrentMatch(null);
        resetFormData();
        
        Alert.alert("Success", "Match updated successfully!");
      }, 500);
    } catch (error) {
      console.error("Error updating match:", error);
      Alert.alert("Error", "Failed to update match. Please try again.");
    }
  };

  const handleDeleteMatch = async (id) => {
    // Find the match to delete
    const matchToDelete = matches.find(match => match.id === id);
    
    // Ensure organizer can only delete their own matches
    if (matchToDelete && matchToDelete.createdBy !== userData?._id) {
      Alert.alert("Error", "You can only delete matches that you created.");
      return;
    }

    Alert.alert(
      "Delete Match",
      "Are you sure you want to delete this match?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // In a real implementation, this would be an API call to delete a match
              // Example:
              // await axios.delete(`${API_URL}/api/v1/tournaments/${id}`, {
              //   headers: { Authorization: `Bearer ${userToken}` }
              // });
              
              // Simulate API call with a delay
              setTimeout(() => {
                const filteredMatches = matches.filter(match => match.id !== id);
                setMatches(filteredMatches);
                Alert.alert("Success", "Match deleted successfully!");
              }, 500);
            } catch (error) {
              console.error("Error deleting match:", error);
              Alert.alert("Error", "Failed to delete match. Please try again.");
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
      Alert.alert("Error", "You can only edit matches that you created.");
      return;
    }

    setCurrentMatch(match);
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
          <Text style={styles.loadingText}>Loading matches...</Text>
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
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.createButtonText}>Create New Match</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="My Matches" />
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

        <SectionHeader title="Other Organizers' Matches" />
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
  }
});

export default ManageMatchesScreen; 