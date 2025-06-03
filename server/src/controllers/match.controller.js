import Match from "../models/match.model.js";
import Tournament from "../models/Tournament.model.js";
import PlayerAuth from "../models/playerAuth.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create a new match
const createMatch = asyncHandler(async (req, res) => {
  const {
    tournamentId,
    matchNumber,
    player1,
    player2,
    startTime,
    round,
    location,
    notes
  } = req.body;

  // Validate required fields
  if (!tournamentId || !matchNumber || !player1 || !player2 || !startTime || !round) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Check if players exist
  const player1Exists = await PlayerAuth.findById(player1);
  const player2Exists = await PlayerAuth.findById(player2);

  if (!player1Exists || !player2Exists) {
    throw new ApiError(404, "One or both players not found");
  }

  // Check if match with same number already exists in this tournament
  const existingMatch = await Match.findOne({ tournamentId, matchNumber });
  if (existingMatch) {
    throw new ApiError(
      409,
      `Match number ${matchNumber} already exists in this tournament`
    );
  }

  // Create the match
  const createdBy = req.user._id;
  const createdByModel = req.user.role === "admin" ? "Admin" : "Organizer";

  const match = await Match.create({
    tournamentId,
    matchNumber,
    player1,
    player2,
    startTime,
    round,
    location,
    notes,
    createdBy,
    createdByModel
  });

  return res
    .status(201)
    .json(new ApiResponse(201, match, "Match created successfully"));
});

// Get all matches for a tournament
const getAllMatches = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const { status, round } = req.query;

  // Validate tournamentId
  if (!tournamentId) {
    throw new ApiError(400, "Tournament ID is required");
  }

  // Check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Create filter
  const filter = { tournamentId };
  if (status) filter.status = status;
  if (round) filter.round = Number(round);

  // Get matches
  const matches = await Match.find(filter)
    .populate([
      { path: "player1", select: "username name profileImage" },
      { path: "player2", select: "username name profileImage" },
      { path: "winner", select: "username name profileImage" }
    ])
    .sort({ matchNumber: 1 });

  return res.status(200).json(
    new ApiResponse(200, matches, "Matches fetched successfully")
  );
});

// Get a specific match by ID
const getMatchById = asyncHandler(async (req, res) => {
  const { matchId } = req.params;

  // Validate matchId
  if (!matchId) {
    throw new ApiError(400, "Match ID is required");
  }

  // Find match
  const match = await Match.findById(matchId).populate([
    { path: "player1", select: "username name profileImage" },
    { path: "player2", select: "username name profileImage" },
    { path: "winner", select: "username name profileImage" },
    { path: "tournamentId", select: "name description" }
  ]);

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, match, "Match fetched successfully"));
});

// Update a match
const updateMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const updateData = req.body;

  // Validate matchId
  if (!matchId) {
    throw new ApiError(400, "Match ID is required");
  }

  // Remove fields that shouldn't be updated directly
  delete updateData.createdBy;
  delete updateData.createdByModel;

  // Find and update match
  const updatedMatch = await Match.findByIdAndUpdate(
    matchId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedMatch) {
    throw new ApiError(404, "Match not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMatch, "Match updated successfully"));
});

// Update match score and winner
const updateMatchResults = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { player1Score, player2Score, winner, status } = req.body;

  // Validate matchId and required fields
  if (!matchId) {
    throw new ApiError(400, "Match ID is required");
  }

  if (status === "completed" && (!player1Score || !player2Score || !winner)) {
    throw new ApiError(
      400,
      "Player scores and winner are required when marking a match as completed"
    );
  }

  // Find match
  const match = await Match.findById(matchId);
  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // Update match
  if (player1Score !== undefined) {
    match.score.player1Score = player1Score;
  }
  if (player2Score !== undefined) {
    match.score.player2Score = player2Score;
  }
  if (winner) {
    match.winner = winner;
  }
  if (status) {
    match.status = status;
  }
  if (status === "completed" && !match.endTime) {
    match.endTime = new Date();
  }

  await match.save();

  return res
    .status(200)
    .json(new ApiResponse(200, match, "Match results updated successfully"));
});

// Delete a match
const deleteMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;

  // Validate matchId
  if (!matchId) {
    throw new ApiError(400, "Match ID is required");
  }

  // Find and delete match
  const deletedMatch = await Match.findByIdAndDelete(matchId);

  if (!deletedMatch) {
    throw new ApiError(404, "Match not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Match deleted successfully"));
});

export {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  updateMatchResults,
  deleteMatch
};