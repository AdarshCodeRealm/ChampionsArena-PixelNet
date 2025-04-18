import React, { useState } from "react";
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

const ManageMatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const resetFormData = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleCreateMatch = () => {
    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    const newMatch = createMatchObject(formData);
    setMatches([...matches, newMatch]);
    setModalVisible(false);
    resetFormData();
  };

  const handleUpdateMatch = () => {
    if (!currentMatch) return;

    // Validate form
    if (!validateMatchForm(formData)) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

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
  };

  const handleDeleteMatch = (id) => {
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
          onPress: () => {
            const filteredMatches = matches.filter(match => match.id !== id);
            setMatches(filteredMatches);
          },
          style: "destructive",
        },
      ]
    );
  };

  const openEditModal = (match) => {
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

        <SectionHeader title="Upcoming Matches" />
        {matches
          .filter(match => match.status === "upcoming")
          .map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onEdit={openEditModal} 
              onDelete={handleDeleteMatch} 
            />
          ))
        }

        <SectionHeader title="Completed Matches" />
        {matches
          .filter(match => match.status === "completed")
          .map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onEdit={openEditModal} 
              onDelete={handleDeleteMatch} 
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
});

export default ManageMatchesScreen; 