import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
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
  prizePool: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  registeredTeams: {
    type: Number,
    default: 0
  },
  teamSize: {
    type: Number,
    required: true
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
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  format: {
    type: String,
    enum: ['Solo', 'Duo', 'Teams'],
    default: 'Teams'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  }
}, 
{
  timestamps: true // Adds createdAt and updatedAt
});

// Method to get public tournament data
TournamentSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    title: this.name, // For frontend compatibility
    description: this.description,
    game: this.game,
    date: this.date,
    time: this.time,
    prizePool: this.prizePool,
    teamSize: this.teamSize,
    maxTeams: this.maxTeams,
    registeredTeams: this.registeredTeams,
    bannerImage: this.bannerImage,
    status: this.status,
    format: this.format,
    organizer: this.organizerName,
    createdBy: this.organizer,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('Tournament', TournamentSchema);