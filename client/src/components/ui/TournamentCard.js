import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { tournamentStyles } from '../../styles/globalStyles';

const TournamentCard = ({ tournament, onPress }) => {
  // Define better colors for status indicators
  const statusColors = {
    upcoming: 'rgba(255, 87, 51, 0.9)', // Vibrant orange-red
    completed: 'rgba(75, 123, 236, 0.9)', // Rich blue
    live: 'rgba(235, 47, 6, 0.9)', // Bright red for live tournaments
    cancelled: 'rgba(120, 120, 120, 0.9)' // Gray for cancelled tournaments
  };

  // Get the appropriate color based on status or default to orange-red
  const statusColor = statusColors[tournament.status] || statusColors.upcoming;

  return (
    <TouchableOpacity 
      style={tournamentStyles.tournamentCard} 
      onPress={() => onPress(tournament)}
    >
      {/* Status flag at top left corner */}
      {tournament.status && (
        <View style={[
          tournamentStyles.statusFlag, 
          { 
            backgroundColor: statusColor,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderTopLeftRadius: 8,
            borderBottomRightRadius: 8
          }
        ]}>
          <Text style={{ color: '#ffffff', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {tournament.status}
          </Text>
        </View>
      )}
      
      {/* Ensure bannerImage exists in tournament object and has a valid URL */}
      <Image
        source={{ 
          uri: tournament.bannerImage || 'https://i.pinimg.com/736x/41/b9/ee/41b9eed394ab758224d56518d4b2d41a.jpg'
        }}
        style={{
          width: '100%',
          height: 150, // Fixed height for banner
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
        alt='banner'
        resizeMode="cover"
      />
      <View style={tournamentStyles.tournamentHeader}>
        <Text style={tournamentStyles.tournamentName}>{tournament.name}</Text>
        <View style={tournamentStyles.prizeBadge}>
          <Text style={tournamentStyles.prizeText}>₹{tournament.prize.replace('$', '')}</Text>
        </View>
      </View>
      <Text style={tournamentStyles.tournamentGame}>{tournament.game}</Text>
      <Text style={[tournamentStyles.tournamentGame, { fontSize: 12, marginTop: 2, color: '#666' }]}>
        Organizer: {tournament.organizer}
      </Text>
      <View style={tournamentStyles.tournamentDetails}>
        <View style={[tournamentStyles.detailItem, { flex: 2 }]}>
          <Ionicons name="calendar-outline" size={16} color="#0d84c3" />
          <Text style={tournamentStyles.detailText}>
            {tournament.date} • 16:00 
          </Text>
        </View>
        <View style={tournamentStyles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#0d84c3" />
          <Text style={tournamentStyles.detailText}>
            {tournament.registeredTeams}/{tournament.maxTeams} Teams
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={tournamentStyles.registerButton} 
        onPress={() => onPress(tournament)}
      >
        <Text style={[tournamentStyles.registerButtonText, { 
          color: '#ffffff',
          backgroundColor: statusColor,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 6,
          overflow: 'hidden',
          textAlign: 'center'
        }]}>
          {tournament.status === 'upcoming' ? 'Register Now' : 'View Details'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default TournamentCard;