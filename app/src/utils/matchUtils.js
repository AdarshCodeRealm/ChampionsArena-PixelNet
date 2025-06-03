// List of available games
export const GAMES = [
  "Free Fire MAX",
  "PUBG Mobile",
  "Call of Duty Mobile",
  "Fortnite Mobile",
  "Clash Royale",
];

// Initial mock data for matches
export const INITIAL_MATCHES = [
  {
    id: "1",
    title: "Championship Finals",
    description: "The final championship match for the best teams. Winner takes all!",
    game: "Free Fire MAX",
    date: "2023-08-15",
    time: "18:00",
    status: "upcoming",
    prizePool: "$10,000",
    teamSize: 4,
    maxTeams: 16,
  },
  {
    id: "2",
    title: "Qualifier Round 2",
    description: "Second qualifier round for the upcoming championship.",
    game: "PUBG Mobile",
    date: "2023-08-10",
    time: "20:00",
    status: "completed",
    score: "3-1",
    prizePool: "$5,000",
    teamSize: 4,
    maxTeams: 32,
  },
  {
    id: "3",
    title: "Weekly Tournament",
    description: "Weekly casual tournament with prizes for top performers.",
    game: "Call of Duty Mobile",
    date: "2023-08-20",
    time: "19:30",
    status: "upcoming",
    prizePool: "$2,000",
    teamSize: 5,
    maxTeams: 20,
  },
];

// Default form data structure
export const DEFAULT_FORM_DATA = {
  title: "",
  description: "",
  game: GAMES[0],
  date: "",
  time: "",
  prizePool: "",
  teamSize: "",
  maxTeams: "",
};

// Utility function to validate match form data
export const validateMatchForm = (formData) => {
  if (!formData.title || !formData.date || !formData.time || 
      !formData.prizePool || !formData.teamSize || !formData.maxTeams) {
    return false;
  }
  return true;
};

// Function to create a new match object
export const createMatchObject = (formData) => {
  return {
    id: Date.now().toString(),
    title: formData.title,
    description: formData.description || "",
    game: formData.game,
    date: formData.date,
    time: formData.time,
    status: "upcoming",
    prizePool: formData.prizePool,
    teamSize: parseInt(formData.teamSize),
    maxTeams: parseInt(formData.maxTeams),
  };
}; 