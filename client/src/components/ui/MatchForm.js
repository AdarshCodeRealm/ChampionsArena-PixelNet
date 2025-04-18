import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../styles/globalStyles";
import { GAMES } from "../../utils/matchUtils";

const MatchForm = ({ formData, setFormData }) => {
  return (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Match Title</Text>
        <TextInput 
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="Enter match title"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Enter match description"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Game</Text>
        <View style={styles.selectContainer}>
          {GAMES.map(game => (
            <TouchableOpacity 
              key={game}
              style={[
                styles.gameOption,
                formData.game === game && styles.selectedGameOption
              ]}
              onPress={() => setFormData({...formData, game})}
            >
              <Text 
                style={[
                  styles.gameOptionText,
                  formData.game === game && styles.selectedGameOptionText
                ]}
              >
                {game}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.formLabel}>Date</Text>
          <TextInput 
            style={styles.input}
            value={formData.date}
            onChangeText={(text) => setFormData({...formData, date: text})}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
        
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.formLabel}>Time</Text>
          <TextInput 
            style={styles.input}
            value={formData.time}
            onChangeText={(text) => setFormData({...formData, time: text})}
            placeholder="HH:MM"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Prize Pool</Text>
        <TextInput 
          style={styles.input}
          value={formData.prizePool}
          onChangeText={(text) => setFormData({...formData, prizePool: text})}
          placeholder="Enter prize pool"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.formLabel}>Team Size</Text>
          <TextInput 
            style={styles.input}
            value={formData.teamSize}
            onChangeText={(text) => setFormData({...formData, teamSize: text})}
            placeholder="Enter team size"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.formLabel}>Max Teams</Text>
          <TextInput 
            style={styles.input}
            value={formData.maxTeams}
            onChangeText={(text) => setFormData({...formData, maxTeams: text})}
            placeholder="Enter max teams"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="numeric"
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  formLabel: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gameOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
    marginRight: 8,
  },
  selectedGameOption: {
    backgroundColor: colors.primary,
  },
  gameOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  selectedGameOptionText: {
    fontWeight: "bold",
  },
});

export default MatchForm; 