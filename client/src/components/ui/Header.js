import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title, profile, onProfilePress }) => {
  // Check if this is a guest profile
  const isGuestProfile = profile && profile.id === 'guest';
  const navigation = useNavigation();
  const { logout, userToken } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Get the display name from profile with multiple fallbacks
  const getDisplayName = () => {
    if (!profile) return '';
    
    // Try all possible property names for the name
    return profile.name || 
           profile.fullName || 
           profile.displayName || 
           profile.username ||
           'User';
  };

  // Handle login button press
  const handleLoginPress = async () => {
    // Prevent multiple clicks
    if (loggingOut) return;
    
    try {
      setLoggingOut(true);
      // Logout the user - this will clear tokens and navigate
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={globalStyles.header}>
      <Text style={globalStyles.headerTitle}>{title}</Text>
      
      {/* Show profile button for regular users */}
      {profile && !isGuestProfile && (
        <View style={globalStyles.profileContainer}>
          <Text style={globalStyles.profileName}>{getDisplayName()}</Text>
          <TouchableOpacity 
            style={globalStyles.profileButton}
            onPress={onProfilePress}
          >
            {profile.profilePicture || profile.avatar || profile.photoUrl ? (
              <Image 
                source={{ uri: profile.profilePicture || profile.avatar || profile.photoUrl }} 
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
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
          ) : (
            <>
              <Text style={{ color: '#fff', marginRight: 6, fontSize: 14 }}>Login</Text>
              <Ionicons name="log-in-outline" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;