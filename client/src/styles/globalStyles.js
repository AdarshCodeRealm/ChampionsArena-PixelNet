import { StyleSheet } from 'react-native';

// App theme colors
export const colors = {
  background: '#0a1622',
  cardBackground: '#0d1a26',
  primary: '#0d84c3',
  border: '#0d2436',
  text: {
    primary: '#ffffff',
    secondary: '#6c757d',
    accent: '#0d84c3',
  },
  status: {
    success: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
    gold: '#ffc107',
    silver: '#95a5a6',
    bronze: '#cd7f32',
  }
};

// Global styles used across the app
export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    color: colors.text.primary,
    marginRight: 8,
    fontSize: 14,
  },
  profileButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileAvatar: {
    height: '100%',
    width: '100%',
  },
  avatarPlaceholder: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 12,
  },
  subtitleText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 15,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: colors.text.primary,
  },
});

// Game specific styles
export const gameStyles = StyleSheet.create({
  gamesList: {
    marginBottom: 10,
  },
  gameCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  gameName: {
    color: colors.text.primary,
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});

// Tournament specific styles
export const tournamentStyles = StyleSheet.create({
  tournamentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tournamentName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  prizeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  prizeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentGame: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 8,
  },
  tournamentDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: colors.text.primary,
    fontSize: 12,
    marginLeft: 4,
  },
  enrolledCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  enrolledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  enrolledName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  detailButton: {
    backgroundColor: colors.border,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: `rgba(${parseInt(colors.status.danger.slice(1, 3), 16)}, ${parseInt(colors.status.danger.slice(3, 5), 16)}, ${parseInt(colors.status.danger.slice(5, 7), 16)}, 0.2)`,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.status.danger,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

// News styles
export const newsStyles = StyleSheet.create({
  newsCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  newsSummary: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 8,
  },
  newsDate: {
    color: colors.primary,
    fontSize: 12,
  },
});

// Player and leaderboard styles
export const playerStyles = StyleSheet.create({
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerRank: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
    width: 30,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerStats: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  playerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leaderboardHeaderItem: {
    flex: 1,
    alignItems: 'center',
  },
  leaderboardHeaderText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Sponsor styles
export const sponsorStyles = StyleSheet.create({
  sponsorsList: {
    marginBottom: 20,
  },
  sponsorCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  sponsorLogo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.text.primary,
    marginBottom: 8,
  },
  sponsorName: {
    color: colors.text.primary,
    fontSize: 12,
    textAlign: 'center',
  },
});

// Profile styles
export const profileStyles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileUsername: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    color: colors.text.primary,
    fontSize: 16,
    flex: 1,
  },
  newBadge: {
    backgroundColor: colors.status.danger,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileHeaderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileHeaderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileHeaderName: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileHeaderUsername: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 10,
  },
  profileRankBadge: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 5,
  },
  profileRankText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  profileLevel: {
    color: colors.text.primary,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  statNumber: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievement: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.2)`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementText: {
    color: colors.text.primary,
    fontSize: 12,
  },
  matchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchResultIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  matchHistoryContent: {
    flex: 1,
  },
  matchHistoryTitle: {
    color: colors.text.primary,
    fontSize: 14,
  },
  matchHistoryDetails: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  matchHistoryScore: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});