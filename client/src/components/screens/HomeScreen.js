import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../ui/Header";
import SectionHeader from "../ui/SectionHeader";
import NewsCard from "../ui/NewsCard";
import TournamentCard from "../ui/TournamentCard";
import PlayerCard from "../ui/PlayerCard";
import {
  globalStyles,
  gameStyles,
  sponsorStyles,
} from "../../styles/globalStyles";
import { useAuth } from '../../contexts/AuthContext';

// Mock data directly in HomeScreen
const GAMES = [
  { id: "1", name: "Free Fire MAX", image: "https://via.placeholder.com/80" },
];

// Free Fire Carousel Images
const CAROUSEL_IMAGES = [
  {
    id: "1",
    image:
      "https://i.pinimg.com/474x/9f/39/8a/9f398a89d1284510e49723f2633d07c8.jpg",
      
  },
  {
    id: "2",
    image:
      "https://i.pinimg.com/736x/da/8b/1d/da8b1d45d750a4b928bd1d6634601a6e.jpg",
  },
  {
    id: "3",
    image:
      "https://i.pinimg.com/474x/7d/91/ee/7d91eeb46a9d7ac211c089b7b57abec2.jpg",
  },

  {
    id: "4",
    image:
      "https://i.pinimg.com/474x/45/05/76/450576aea2a98f0969818d28b80f3b52.jpg",
  },
  {
    id: "5",
    image: "https://i.pinimg.com/736x/54/05/4b/54054b438c3130dd9e0df3355780a05d.jpg",
  },
];

const TOURNAMENTS = [
  {
    id: "1",
    name: "Free Fire Summer Championship",
    game: "Free Fire MAX",
    prize: "$1,000",
    date: "June 15, 2023",
    teams: 32,
    status: "upcoming",
  },
  {
    id: "2",
    name: "Free Fire Winter League",
    game: "Free Fire MAX",
    prize: "$500",
    date: "December 5, 2023",
    teams: 16,
    status: "upcoming",
  },
  {
    id: "3",
    name: "Free Fire Spring Tournament",
    game: "Free Fire MAX",
    prize: "$750",
    date: "March 10, 2023",
    teams: 24,
    status: "completed",
  },
];

const USERS = [
  {
    id: "1",
    name: "Alex Johnson",
    rank: 1,
    wins: 42,
    losses: 5,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Maria Garcia",
    rank: 2,
    wins: 39,
    losses: 8,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "James Wilson",
    rank: 3,
    wins: 36,
    losses: 10,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "4",
    name: "Sarah Lee",
    rank: 4,
    wins: 34,
    losses: 12,
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "5",
    name: "David Kim",
    rank: 5,
    wins: 32,
    losses: 15,
    avatar: "https://via.placeholder.com/50",
  },
];

const NEWS_ITEMS = [
  {
    id: "1",
    title: "Free Fire World Cup Announced",
    summary:
      "The biggest Free Fire tournament of the year with a prize pool of $2,000,000",
    image: "https://via.placeholder.com/150",
    date: "Today",
  },
  {
    id: "2",
    title: "New Free Fire Season Starting Next Week",
    summary: "Get ready for new weapons, maps and exclusive rewards",
    image: "https://via.placeholder.com/150",
    date: "Yesterday",
  },
  {
    id: "3",
    title: 'Pro Player "FireKing" Joins Team Alpha',
    summary: "Top ranked player makes a shocking move to the championship team",
    image: "https://via.placeholder.com/150",
    date: "2 days ago",
  },
];

const SPONSORS = [
  { id: "1", name: "GameFuel Energy", logo: "https://via.placeholder.com/100" },
  { id: "2", name: "Razor Gaming", logo: "https://via.placeholder.com/100" },
  { id: "3", name: "TechPro Gear", logo: "https://via.placeholder.com/100" },
  { id: "4", name: "CyberNet ISP", logo: "https://via.placeholder.com/100" },
];

const HomeScreen = ({ navigation }) => {
  // Get screen width for carousel sizing
  const screenWidth = Dimensions.get("window").width;
  const carouselItemWidth = screenWidth - 40; // Account for padding

  // For carousel indicators
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);

  // Auto-scroll effect for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        const nextSlide = (activeSlide + 1) % CAROUSEL_IMAGES.length;
        flatListRef.current.scrollToIndex({
          index: nextSlide,
          animated: true,
        });
        setActiveSlide(nextSlide);
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlide]);

  const handleNewsPress = (news) => {
    console.log("News pressed:", news);
    // Navigation would go here
  };

  const handleTournamentPress = (tournament) => {
    console.log("Tournament pressed:", tournament);
    // Navigation would go here
  };

  const handlePlayerPress = (player) => {
    console.log("Player pressed:", player);
    // Navigation would go here
  };

  const handleViewAllPress = (section) => {
    console.log("View all pressed for section:", section);
    // Navigation would go here
    if (section === "tournaments") {
      navigation.navigate("Matches");
    } else if (section === "players") {
      navigation.navigate("Leaderboard");
    }
  };

  // Add auth context
  const { userData } = useAuth();
  
  // Replace hardcoded user profile with a function to get profile data
  const getProfileData = () => {
    if (userData) {
      console.log("HomeScreen userData:", userData); // Debug log
      return {
        name: userData.name || userData.displayName || userData.fullName || userData.email?.split('@')[0] || "User",
        username: userData.username || userData.userName || userData.email || "@user",
        profilePicture: userData.profilePicture || userData.avatar || userData.profileImage || userData.photoUrl,
        // Include all potential properties that might exist in userData
        ...userData
      };
    }
    // Fallback for testing only if no userData exists
    return {
      name: "John Doe",
      username: "@johndoe",
      avatar: "https://via.placeholder.com/80",
    };
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <Header 
        title="Champions Arena"
        profile={getProfileData()}
        onProfilePress={() => navigation.navigate('Profile')}
      />
      <ScrollView style={globalStyles.container}>
        {/* Free Fire Carousel - Now First */}
        <SectionHeader title="FREE FIRE HIGHLIGHTS" />
        <View>
          <FlatList
            ref={flatListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={carouselItemWidth + 10}
            snapToAlignment="center"
            decelerationRate="fast"
            data={CAROUSEL_IMAGES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  width: carouselItemWidth,
                  height: 200,
                  marginRight: 10,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              </View>
            )}
            style={{ marginBottom: 10 }}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.floor(
                (event.nativeEvent.contentOffset.x + carouselItemWidth / 2) /
                  carouselItemWidth
              );
              setActiveSlide(slideIndex);
            }}
          />

          {/* Carousel indicators */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {CAROUSEL_IMAGES.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActiveSlide(index);
                  flatListRef.current.scrollToIndex({ index, animated: true });
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor:
                      activeSlide === index ? "#FF4500" : "#D3D3D3",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Latest News */}
        <SectionHeader
          title="LATEST NEWS"
          showViewAll={true}
          onViewAllPress={() => handleViewAllPress("news")}
        />

        {NEWS_ITEMS.map((item) => (
          <NewsCard key={item.id} news={item} onPress={handleNewsPress} />
        ))}

       

        {/* Upcoming Tournaments */}
        <SectionHeader
          title="UPCOMING TOURNAMENTS"
          showViewAll={true}
          onViewAllPress={() => handleViewAllPress("tournaments")}
        />
        {TOURNAMENTS.filter((t) => t.status === "upcoming").map(
          (tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onPress={handleTournamentPress}
            />
          )
        )}
         {/* Our Sponsors */}
         <SectionHeader title="OUR SPONSORS" />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SPONSORS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={sponsorStyles.sponsorCard}>
              <Image
                source={{ uri: item.logo }}
                style={sponsorStyles.sponsorLogo}
              />
              <Text style={sponsorStyles.sponsorName}>{item.name}</Text>
            </View>
          )}
          style={sponsorStyles.sponsorsList}
        />

        {/* Top Players */}
        <SectionHeader
          title="TOP PLAYERS"
          showViewAll={true}
          onViewAllPress={() => handleViewAllPress("players")}
        />
        {USERS.slice(0, 3).map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={index}
            onPress={handlePlayerPress}
          />
        ))}
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
