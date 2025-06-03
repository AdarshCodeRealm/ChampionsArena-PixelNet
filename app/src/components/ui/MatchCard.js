import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../styles/globalStyles";

const MatchCard = ({ match, onEdit, onDelete, isEditable = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return colors.status.info;
      case "completed":
        return colors.status.success;
      case "cancelled":
        return colors.status.danger;
      default:
        return colors.status.warning;
    }
  };

  return (
    <View style={[styles.matchCard, { backgroundColor: getStatusColor(match.status) }]}>
      <View style={styles.matchCardHeader}>
        <Text style={styles.matchTitle}>{match.title}</Text>
        {isEditable && (
          <View style={styles.matchActions}>
            <TouchableOpacity onPress={() => onEdit(match)} style={styles.actionButton}>
              <Ionicons name="create" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(match.id)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.matchGame}>{match.game}</Text>
      
      {match.description ? (
        <Text style={styles.matchDescription}>{match.description}</Text>
      ) : null}
      
      <View style={styles.matchDetailsRow}>
        <View style={styles.matchDetail}>
          <Ionicons name="calendar" size={16} color="#fff" />
          <Text style={styles.matchDetailText}>{match.date}</Text>
        </View>
        <View style={styles.matchDetail}>
          <Ionicons name="time" size={16} color="#fff" />
          <Text style={styles.matchDetailText}>{match.time}</Text>
        </View>
      </View>
      <View style={styles.matchInfoRow}>
        <View style={styles.matchInfoItem}>
          <Ionicons name="trophy" size={16} color="#ffd700" />
          <Text style={styles.matchInfoText}>{match.prizePool}</Text>
        </View>
        <View style={styles.matchInfoItem}>
          <Ionicons name="people" size={16} color="#fff" />
          <Text style={styles.matchInfoText}>{match.teamSize} players</Text>
        </View>
        <View style={styles.matchInfoItem}>
          <Ionicons name="flag" size={16} color="#fff" />
          <Text style={styles.matchInfoText}>{match.maxTeams} teams max</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  matchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  matchTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  matchActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
  },
  matchGame: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
  },
  matchDescription: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.9,
    lineHeight: 18,
  },
  matchDetailsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  matchDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  matchDetailText: {
    color: "#fff",
    marginLeft: 6,
  },
  matchInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  matchInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchInfoText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
  },
});

export default MatchCard; 