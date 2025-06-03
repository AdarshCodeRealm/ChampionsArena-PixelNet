import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { playerStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/globalStyles';

const PlayerCard = ({ player, index, onPress }) => {
  const isTopPlayer = index === 0;
  
  return (
    <TouchableOpacity 
      style={playerStyles.playerCard}
      onPress={() => onPress(player)}
    >
      <Text style={playerStyles.playerRank}>#{player.rank}</Text>
      <Image source={{ uri: player.avatar }} style={playerStyles.playerAvatar} />
      <View style={playerStyles.playerInfo}>
        <Text style={playerStyles.playerName}>{player.name}</Text>
        <Text style={playerStyles.playerStats}>
          {player.wins} Wins • {player.losses || 0} Losses
        </Text>
      </View>
      <View style={[
        playerStyles.playerBadge, 
        { backgroundColor: isTopPlayer ? colors.status.gold : colors.primary }
      ]}>
        <Ionicons name={isTopPlayer ? 'trophy' : 'star'} size={14} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export default PlayerCard; 