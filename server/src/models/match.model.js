import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true
    },
    matchNumber: {
      type: Number,
      required: true
    },
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerAuth",
      required: true
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerAuth",
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled"
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerAuth"
    },
    score: {
      player1Score: {
        type: Number,
        default: 0
      },
      player2Score: {
        type: Number,
        default: 0
      }
    },
    round: {
      type: Number,
      required: true
    },
    location: {
      type: String
    },
    notes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel"
    },
    createdByModel: {
      type: String,
      enum: ["Admin", "Organizer"],
      required: true
    }
  },
  { timestamps: true }
);

// Create indexing for better query performance
matchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });
matchSchema.index({ startTime: 1 });
matchSchema.index({ status: 1 });

const Match = mongoose.model("Match", matchSchema);
export default Match;