import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { colors } from "../../styles/globalStyles";
import MatchForm from "./MatchForm";

const { height: screenHeight } = Dimensions.get('window');

const MatchModal = ({ 
  visible, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  isEditMode = false,
  initialBannerImage = null
}) => {
  const [bannerImage, setBannerImage] = useState(null);

  // Reset banner image when modal is closed
  useEffect(() => {
    if (!visible) {
      // Only reset if we're not in edit mode or there's no initial banner
      if (!isEditMode || !initialBannerImage) {
        setBannerImage(null);
      }
    } else {
      // Set initial banner image when opening in edit mode
      if (isEditMode && initialBannerImage) {
        setBannerImage(initialBannerImage);
      }
    }
  }, [visible, isEditMode, initialBannerImage]);

  const handleSubmit = () => {
    // Call onSubmit handler with both formData and bannerImage
    onSubmit(formData, bannerImage);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Edit Match" : "Create New Match"}
            </Text>
          </View>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <MatchForm 
              formData={formData} 
              setFormData={setFormData}
              bannerImage={bannerImage}
              setBannerImage={setBannerImage}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, isEditMode ? styles.updateButton : styles.createButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.modalButtonText}>
                {isEditMode ? "Update Match" : "Create Match"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: '100%',
    maxHeight: screenHeight * 0.8, // 80% of screen height
    flexDirection: 'column',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  scrollContainer: {
    flexGrow: 1,
    maxHeight: screenHeight * 0.6, // 60% of screen height for the form
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: colors.status.warning,
    marginLeft: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MatchModal; 