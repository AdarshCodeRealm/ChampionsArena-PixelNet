import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const Header = ({ title, profile, onProfilePress }) => {
  return (
    <View style={globalStyles.header}>
      <Text style={globalStyles.headerTitle}>{title}</Text>
      {profile && (
        <View style={globalStyles.profileContainer}>
          <Text style={globalStyles.profileName}>{profile.rank}</Text>
          <TouchableOpacity 
            style={globalStyles.profileButton}
            onPress={onProfilePress}
          >
            <Image 
              source={{ uri: profile.avatar }} 
              style={globalStyles.profileAvatar} 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Header; 