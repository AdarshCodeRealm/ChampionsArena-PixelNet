import mongoose from 'mongoose';

// Create a counter schema for auto-incrementing tournament numbers
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.model('Counter', counterSchema);

const tournamentSchema = new mongoose.Schema(
  {
    tournamentNumber: {
      type: Number,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: [true, "Tournament title is required"],
      trim: true,
      minlength: [3, "Tournament title must be at least 3 characters"],
      maxlength: [100, "Tournament title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Tournament description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    game: {
      type: String,
      required: [true, "Game name is required"],
      trim: true
    },
    teamSize: {
      type: String,
      required: [true, "Team size is required"],
      enum: ["solo", "duo", "squad", "other"],
      default: "squad"
    },
    customTeamSize: {
      type: Number,
      min: [1, "Team size must be at least 1"],
      max: [100, "Team size cannot exceed 100"]
    },
    startDate: {
      type: Date,
      required: [true, "Tournament start date is required"]
    },
    startTime: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // Validate time format (HH:MM)
        },
        message: props => `${props.value} is not a valid time format! Use HH:MM (24-hour format)`
      }
    },
    maxTeams: {
      type: Number,
      required: [true, "Maximum number of teams is required"],
      min: [2, "Tournament must allow at least 2 teams"],
      max: [1000, "Tournament cannot exceed 1000 teams"]
    },
    entryFee: {
      type: Number,
      default: 0,
      min: [0, "Entry fee cannot be negative"]
    },
    prizePool: {
      type: Number,
      default: 0,
      min: [0, "Prize pool cannot be negative"]
    },
    upiAddress: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ["draft", "open", "full", "ongoing", "completed", "cancelled"],
      default: "draft"
    },
    rules: {
      type: String,
      trim: true,
      maxlength: [5000, "Rules cannot exceed 5000 characters"]
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: [true, "Organizer is required"]
    },
    organizerName: {
      type: String,
      required: [true, "Organizer name is required"]
    },
    platform: {
      type: String,
      required: [true, "Gaming platform is required"],
      enum: ["PC", "Mobile", "Console", "Cross-platform"]
    },
    region: {
      type: String,
      required: [true, "Tournament region is required"],
      trim: true
    },

    registeredTeams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }],
    bannerImage: {
      type: String,
      default: ""
    },
    tournamentFormat: {
      type: String,
      enum: ['solo', 'duo', 'squad', 'single-elimination', 'double-elimination', 'round-robin'],
      default: 'squad'
    },
    winners: [{
      position: {
        type: Number,
        required: true
      },
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
      },
      prize: {
        type: Number,
        default: 0
      }
    }],
    matches: [{
      matchNumber: {
        type: Number,
        required: true
      },
      title: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      date: {
        type: Date
      },
      teams: [{
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team"
        },
        score: {
          type: Number,
          default: 0
        }
      }],
      images: [{
        url: {
          type: String,
          required: true
        },
        caption: {
          type: String,
          trim: true
        }
      }],
      result: {
        type: String,
        trim: true
      },
      status: {
        type: String,
        enum: ["scheduled", "ongoing", "completed", "cancelled"],
        default: "scheduled"
      }
    }]
  },
  { timestamps: true }
);

// Pre-save hook to auto-increment tournament number
tournamentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'tournamentNumber' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.tournamentNumber = counter.value;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Create a Team schema as well
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Team captain is required"]
    },
    members: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      }
    }],
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    paymentId: {
      type: String,
      default: ""
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create public JSON methods to control what data is sent to the client
tournamentSchema.methods.toPublicJSON = function() {
  const tournament = this.toObject();
  return tournament;
};

teamSchema.methods.toPublicJSON = function() {
  const team = this.toObject();
  return team;
};

const Tournament = mongoose.model("Tournament", tournamentSchema);
const Team = mongoose.model("Team", teamSchema);

export { Tournament, Team };
export default Tournament;