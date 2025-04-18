import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../../components/screens/HomeScreen';
import MatchesScreen from '../../components/screens/MatchesScreen';
import LeaderboardScreen from '../../components/screens/LeaderboardScreen';
import ProfileScreen from '../../components/screens/ProfileScreen';
import ManageMatchesScreen from '../../components/screens/ManageMatchesScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import OtpVerificationScreen from '../../screens/auth/OtpVerificationScreen';
import { colors } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

// Create navigators
const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Profile Stack
const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="ManageMatches" component={ManageMatchesScreen} />
  </ProfileStack.Navigator>
);

// Auth Stack
const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
  </AuthStack.Navigator>
);

// Custom theme for NavigationContainer
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.cardBackground,
    text: colors.text.primary,
    border: colors.border,
    notification: colors.primary,
  },
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isLoading, userToken, userData } = useAuth();
  const isGuest = userData?.id === 'guest';

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            {/* Main app screen */}
            <MainStack.Screen name="Main" component={TabNavigator} />

            {/* Auth screens needed for guest users or profile section */}
            <MainStack.Screen name="Login" component={LoginScreen} />
            <MainStack.Screen name="Register" component={RegisterScreen} />
            <MainStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          </>
        ) : (
          <MainStack.Screen name="Auth" component={AuthStackScreen} />
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;