import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { colors } from "../../styles/globalStyles";
import { GAMES } from "../../utils/matchUtils";
import * as ImagePicker from 'expo-image-picker';
import Ionicons from "react-native-vector-icons/Ionicons";

const MatchForm = ({ formData, setFormData, bannerImage, setBannerImage }) => {
  
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload a banner image.');
      return;
    }
    
    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use MediaTypeOptions.Images for expo-image-picker v16+
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setBannerImage(result.assets[0]);
    }
  };
  
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
        <Text style={styles.formLabel}>Banner Image</Text>
        <TouchableOpacity 
          style={styles.bannerUploadContainer}
          onPress={pickImage}
        >
          {bannerImage ? (
            <Image 
              source={{ uri: bannerImage.uri }} 
              style={styles.bannerImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="image-outline" size={32} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.bannerPlaceholderText}>
                Tap to upload a banner image
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
  bannerUploadContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPlaceholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontSize: 14,
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