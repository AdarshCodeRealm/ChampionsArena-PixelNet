import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ title, profile, onProfilePress }) => {
  // Check if this is a guest profile
  const isGuestProfile = profile && profile.id === 'guest';
  const navigation = useNavigation();

  // Handle login button press
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={globalStyles.header}>
      <Text style={globalStyles.headerTitle}>{title}</Text>
      
      {/* Show profile button for regular users */}
      {profile && !isGuestProfile && (
        <View style={globalStyles.profileContainer}>
          <Text style={globalStyles.profileName}>{profile.username}</Text>
          <TouchableOpacity 
            style={globalStyles.profileButton}
            onPress={onProfilePress}
          >
            <Image 
              source={{ uri: profile.avatar || 'https://via.placeholder.com/36' }} 
              style={globalStyles.profileAvatar} 
            />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Special guest profile button */}
      {isGuestProfile && (
        <TouchableOpacity 
          style={[globalStyles.profileContainer, { backgroundColor: 'rgba(13, 132, 195, 0.2)', padding: 6, borderRadius: 20 }]}
          onPress={onProfilePress}
        >
          <Text style={[globalStyles.profileName, { marginRight: 8 }]}>Guest</Text>
          <View style={globalStyles.profileButton}>
            <Ionicons name="person" size={20} color="#fff" style={{ alignSelf: 'center', marginTop: 6 }} />
          </View>
        </TouchableOpacity>
      )}
      
      {/* Login button if no profile */}
      {!profile && (
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(13, 132, 195, 0.2)', padding: 6, borderRadius: 20 }}
          onPress={handleLoginPress}
        >
          <Text style={{ color: '#fff', marginRight: 6, fontSize: 14 }}>Login</Text>
          <Ionicons name="log-in-outline" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header; 