import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title, profile, onProfilePress }) => {
  // Check if this is a guest profile
  const isGuestProfile = profile && profile.id === 'guest';
  const navigation = useNavigation();
  const { logout } = useAuth();

  // Handle login button press
  const handleLoginPress = () => {
    // Instead of navigating directly, we'll use the auth context to log out
    // This will trigger the navigation change at the AppNavigator level
    logout();
  };

  return (
    <View style={globalStyles.header}>
      <Text style={globalStyles.headerTitle}>{title}</Text>
      
      {/* Show profile button for regular users */}
      {profile && !isGuestProfile && (
        <View style={globalStyles.profileContainer}>
          <Text style={globalStyles.profileName}>{profile.name || profile.username}</Text>
          <TouchableOpacity 
            style={globalStyles.profileButton}
            onPress={onProfilePress}
          >
            {profile.profilePicture ? (
              <Image 
                source={{ uri: profile.profilePicture }} 
                style={globalStyles.profileAvatar} 
              />
            ) : (
              <View style={globalStyles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            )}
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