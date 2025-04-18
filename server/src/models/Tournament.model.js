import mongoose from "mongoose";
const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  prize: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: null
  },
  registeredTeams: {
    type: Number,
    default: 0
  },
  maxTeams: {
    type: Number,
    required: true
  },
  bannerImage: {
    type: String,
    default: 'https://i.pinimg.com/474x/a6/ee/c4/a6eec4a2cd7d3afcd9a9dfd9f87dc533.jpg'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'Confirmed', 'Pending'],
    default: 'upcoming'
  },
  format: {
    type: String,
    enum: ['Solo', 'Duo', 'Teams'],
    default: 'Teams'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Tournament', TournamentSchema);