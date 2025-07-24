import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import tournamentService from "../services/tournament.service.js";
import { Tournament, Team } from "../models/Tournament.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a new tournament
const createTournament = asyncHandler(async (req, res) => {
  const organizerId = req.organizer._id; // From organizer middleware
  const tournamentData = req.body;
  
  console.log("=== Tournament Creation Request ===");
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  console.log("Request Files:", req.files);
  console.log("================================");
  
  // Set UPI address from organizer data
  tournamentData.upiAddress = req.organizer.upiAddress || '';
  
  // Handle banner image upload if provided
  if (req.file || (req.files && req.files.bannerImage)) {
    const bannerImageFile = req.file ? req.file.path : req.files.bannerImage[0].path;
    const uploaded = await uploadOnCloudinary(bannerImageFile);
    tournamentData.bannerImage = uploaded.url || '';
  } else {
    tournamentData.bannerImage = '';
  }
  
  // Add exact time of tournament start if provided
  if (tournamentData.startTime) {
    const startDate = new Date(tournamentData.startDate);
    const [hours, minutes] = tournamentData.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    tournamentData.startDate = startDate;
  }
  
  const tournament = await tournamentService.createTournament(tournamentData, organizerId);
  console.log("Tournament created successfully");
  return res.status(201).json(
    new ApiResponse(
      201,
      tournament,
      "Tournament created successfully"
    )
  );
});

// Update an existing tournament
const updateTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const organizerId = req.organizer._id; // From organizer middleware
  const updateData = req.body;
  
  // Set UPI address from organizer data
  updateData.upiAddress = req.organizer.upiAddress || '';

  // Handle banner image upload if provided
  if (req.file || (req.files && req.files.bannerImage)) {
    const bannerImageFile = req.file ? req.file.path : req.files.bannerImage[0].path;
    const uploaded = await uploadOnCloudinary(bannerImageFile);
    updateData.bannerImage = uploaded.url || '';
  }
  
  // Handle exact start time update if provided
  if (updateData.startTime) {
    // Get existing tournament to preserve date if not changing
    const existingTournament = await Tournament.findById(tournamentId);
    const startDate = updateData.startDate ? new Date(updateData.startDate) : new Date(existingTournament.startDate);
    const [hours, minutes] = updateData.startTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    updateData.startDate = startDate;
  }
  
  const tournament = await tournamentService.updateTournament(tournamentId, updateData, organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      tournament,
      "Tournament updated successfully"
    )
  );
});

// Delete a tournament
const deleteTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const organizerId = req.organizer._id; // From organizer middleware
  
  await tournamentService.deleteTournament(tournamentId, organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { deleted: true },
      "Tournament deleted successfully"
    )
  );
});

// Get all tournaments for the current organizer
const getOrganizerTournaments = asyncHandler(async (req, res) => {
  const organizerId = req.organizer._id; // From organizer middleware
  
  const tournaments = await tournamentService.getOrganizerTournaments(organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      tournaments,
      "Organizer tournaments fetched successfully"
    )
  );
});

// Get all tournaments with filtering options
const getAllTournaments = asyncHandler(async (req, res) => {
  const { page, limit, status, game, sort, order } = req.query;
  
  const tournaments = await tournamentService.getAllTournaments({
    page, limit, status, game, sort, order
  });
  
  return res.status(200).json(
    new ApiResponse(
      200,
      tournaments,
      "Tournaments fetched successfully"
    )
  );
});

// Get a specific tournament by ID
const getTournamentById = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  
  const tournament = await tournamentService.getTournamentById(tournamentId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      tournament,
      "Tournament fetched successfully"
    )
  );
});

// Register a team for a tournament
const registerTeamForTournament = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const { teamName, members } = req.body;
  const playerId = req.player._id; // From auth middleware
  
  // Check if tournament exists and is open for registration
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }
  
  if (tournament.status !== "open") {
    throw new ApiError(400, "Tournament is not open for registration");
  }
  
  if (new Date() > new Date(tournament.registrationDeadline)) {
    throw new ApiError(400, "Registration deadline has passed");
  }
  
  if (tournament.registeredTeams.length >= tournament.maxTeams) {
    throw new ApiError(400, "Tournament is full");
  }
  
  // Check team size based on tournament requirements
  let requiredTeamSize;
  switch (tournament.teamSize) {
    case "solo":
      requiredTeamSize = 1;
      break;
    case "duo":
      requiredTeamSize = 2;
      break;
    case "squad":
      requiredTeamSize = 4;
      break;
    case "other":
      requiredTeamSize = tournament.customTeamSize;
      break;
  }
  
  // +1 because the captain (current user) is also a member
  if (members.length + 1 !== requiredTeamSize) {
    throw new ApiError(
      400, 
      `This tournament requires exactly ${requiredTeamSize} players per team (including captain)`
    );
  }
  
  // Check if player is already registered in this tournament
  const existingTeam = await Team.findOne({
    tournament: tournamentId,
    $or: [
      { captain: playerId },
      { 'members.player': playerId }
    ]
  });
  
  if (existingTeam) {
    throw new ApiError(400, "You are already registered for this tournament");
  }
  
  // Create the team
  const team = new Team({
    name: teamName,
    captain: playerId,
    members: members.map(member => ({ player: member })),
    tournament: tournamentId,
  });
  
  // If tournament has entry fee, mark payment as pending
  if (tournament.entryFee > 0) {
    team.paymentStatus = "pending";
  } else {
    team.paymentStatus = "completed"; // Free tournaments don't need payment
  }
  
  await team.save();
  
  // Add team to tournament's registered teams
  tournament.registeredTeams.push(team._id);
  await tournament.save();
  
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        team: team.toPublicJSON(),
        requiresPayment: tournament.entryFee > 0,
        entryFee: tournament.entryFee
      },
      "Team registered successfully"
    )
  );
});

// Process payment for tournament registration (placeholder for future implementation)
const processPayment = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { paymentMethod, paymentDetails } = req.body;
  const playerId = req.player._id;
  
  // Validate that the team exists and belongs to this player
  const team = await Team.findOne({
    _id: teamId,
    captain: playerId,
    paymentStatus: "pending"
  }).populate("tournament");
  
  if (!team) {
    throw new ApiError(404, "Team not found or payment not required");
  }
  
  // Validate that the tournament still exists and is open
  const tournament = team.tournament;
  if (!tournament || tournament.status !== "open") {
    throw new ApiError(400, "Tournament is no longer available for registration");
  }
  
  // In a real implementation, you would:
  // 1. Call your payment gateway API
  // 2. Process the payment
  // 3. Update the team's payment status based on the result
  
  // For now, we'll simulate a successful payment
  team.paymentStatus = "completed";
  team.paymentId = "mock_payment_" + Date.now();
  await team.save();
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { team: team.toPublicJSON() },
      "Payment processed successfully"
    )
  );
});

// Get teams registered for a tournament
const getTournamentTeams = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }
  
  const teams = await Team.find({ 
    tournament: tournamentId,
    paymentStatus: "completed" // Only show teams that have completed payment
  }).populate("captain", "username email profilePicture");
  
  return res.status(200).json(
    new ApiResponse(
      200,
      teams.map(team => team.toPublicJSON()),
      "Teams fetched successfully"
    )
  );
});

// Get all teams for the current player
const getMyTeams = asyncHandler(async (req, res) => {
  const playerId = req.player._id;
  
  const teams = await Team.find({
    $or: [
      { captain: playerId },
      { 'members.player': playerId, 'members.status': 'accepted' }
    ]
  }).populate("tournament", "title game startDate status");
  
  return res.status(200).json(
    new ApiResponse(
      200,
      teams.map(team => team.toPublicJSON()),
      "Your teams fetched successfully"
    )
  );
});

// Add winners to a tournament
const addTournamentWinners = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const organizerId = req.organizer._id;
  const { winners } = req.body;
  
  // Use the service to add winners
  const updatedTournament = await tournamentService.addTournamentWinners(tournamentId, winners, organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedTournament,
      "Tournament winners updated successfully"
    )
  );
});

// Add a match record to a tournament
const addMatchRecord = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const organizerId = req.organizer._id;
  
  const { matchNumber, title, description, date, result, status } = req.body;
  const teamsData = JSON.parse(req.body.teams || '[]');
  
  // Process uploaded images
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded && uploaded.url) {
          images.push({
            url: uploaded.url,
            caption: ''
          });
        }
      } catch (error) {
        console.error("Error uploading match image:", error);
      }
    }
  }
  
  // Create match record data
  const matchData = {
    matchNumber: parseInt(matchNumber),
    title,
    description: description || '',
    date: new Date(date),
    teams: teamsData.map(team => ({
      team: team.teamId,
      score: parseInt(team.score) || 0
    })),
    images,
    result: result || '',
    status: status || 'scheduled'
  };
  
  // Use the service to add match record
  const addedMatch = await tournamentService.addMatchRecord(tournamentId, matchData, organizerId);
  
  return res.status(201).json(
    new ApiResponse(
      201,
      addedMatch,
      "Match record added successfully"
    )
  );
});

// Update a match record
const updateMatchRecord = asyncHandler(async (req, res) => {
  const { tournamentId, matchId } = req.params;
  const organizerId = req.organizer._id;
  
  const { title, description, date, result, status } = req.body;
  const teamsData = JSON.parse(req.body.teams || '[]');
  
  // Process uploaded images if any
  const newImages = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded && uploaded.url) {
          newImages.push({
            url: uploaded.url,
            caption: ''
          });
        }
      } catch (error) {
        console.error("Error uploading match image:", error);
      }
    }
  }
  
  // Prepare update data
  const updateData = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (date) updateData.date = new Date(date);
  if (result !== undefined) updateData.result = result;
  if (status) updateData.status = status;
  
  // Update teams if provided
  if (teamsData.length > 0) {
    updateData.teams = teamsData.map(team => ({
      team: team.teamId,
      score: parseInt(team.score) || 0
    }));
  }
  
  // Add new images if any
  if (newImages.length > 0) {
    updateData.newImages = newImages;
  }
  
  // Use the service to update match record
  const updatedMatch = await tournamentService.updateMatchRecord(tournamentId, matchId, updateData, organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedMatch,
      "Match record updated successfully"
    )
  );
});

// Delete a match record
const deleteMatchRecord = asyncHandler(async (req, res) => {
  const { tournamentId, matchId } = req.params;
  const organizerId = req.organizer._id;
  
  // Use the service to delete match record
  await tournamentService.deleteMatchRecord(tournamentId, matchId, organizerId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { deleted: true },
      "Match record deleted successfully"
    )
  );
});

// Register a team by an organizer
const registerTeamByOrganizer = asyncHandler(async (req, res) => {
  const organizerId = req.organizer._id; // From organizer middleware
  const { 
    teamName, 
    captainName,
    captainEmail,
    captainPhone,
    members,
    tournamentId,
    paymentMethod,
    paymentStatus,
    paymentDetails
  } = req.body;

  // Check if tournament exists and is open for registration
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Verify that the organizer owns this tournament
  if (tournament.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "You can only register teams for your own tournaments");
  }
  
  if (tournament.status !== "open") {
    throw new ApiError(400, "Tournament is not open for registration");
  }
  
  if (new Date() > new Date(tournament.registrationDeadline)) {
    throw new ApiError(400, "Registration deadline has passed");
  }
  
  if (tournament.registeredTeams.length >= tournament.maxTeams) {
    throw new ApiError(400, "Tournament is full");
  }

  // Parse members data if it's a string
  let teamMembers;
  try {
    teamMembers = typeof members === 'string' ? JSON.parse(members) : members;
  } catch (error) {
    throw new ApiError(400, "Invalid team members data format");
  }

  // Check team size based on tournament requirements
  let requiredTeamSize;
  switch (tournament.teamSize) {
    case "solo":
      requiredTeamSize = 1;
      break;
    case "duo":
      requiredTeamSize = 2;
      break;
    case "squad":
      requiredTeamSize = 4;
      break;
    case "other":
      requiredTeamSize = tournament.customTeamSize;
      break;
  }
  
  if (teamMembers.length !== requiredTeamSize) {
    throw new ApiError(
      400, 
      `This tournament requires exactly ${requiredTeamSize} players per team`
    );
  }

  // Upload payment receipt if provided
  let paymentReceiptUrl = null;
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (uploaded && uploaded.url) {
      paymentReceiptUrl = uploaded.url;
    }
  }

  // Create the team without linking to existing players since organizer is creating it manually
  const team = new Team({
    name: teamName,
    registrationDate: new Date(),
    registeredBy: "organizer",
    tournament: tournamentId,
    paymentStatus: paymentStatus || "pending",
    paymentMethod: paymentMethod || "cash",
    paymentId: paymentDetails || null,
    paymentReceipt: paymentReceiptUrl,
    // Store captain info in a custom field since they might not be registered in the system
    captainInfo: {
      name: captainName,
      email: captainEmail,
      phone: captainPhone
    },
    // Store member info similarly
    teamMembers: teamMembers.map(member => ({
      name: member.name,
      email: member.email,
      phone: member.phone || null
    }))
  });
  
  await team.save();
  
  // Add team to tournament's registered teams
  tournament.registeredTeams.push(team._id);
  await tournament.save();
  
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        team,
        tournament: {
          title: tournament.title,
          entryFee: tournament.entryFee
        }
      },
      "Team registered successfully by organizer"
    )
  );
});

// Update payment status for a team
const updateTeamPaymentStatus = asyncHandler(async (req, res) => {
  const { tournamentId, teamId } = req.params;
  const { paymentStatus } = req.body;
  const organizerId = req.organizer._id;

  // Verify the tournament exists and belongs to the organizer
  const tournament = await Tournament.findOne({
    _id: tournamentId,
    organizer: organizerId
  });

  if (!tournament) {
    throw new ApiError(404, "Tournament not found or you don't have access to it");
  }

  // Find the team
  const team = await Team.findOne({
    _id: teamId,
    tournament: tournamentId
  });

  if (!team) {
    throw new ApiError(404, "Team not found in this tournament");
  }

  // Update payment status
  team.paymentStatus = paymentStatus;
  
  // If marking as completed, set payment date
  if (paymentStatus === "completed" && !team.paymentDate) {
    team.paymentDate = new Date();
  }
  
  await team.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { team },
      `Payment status updated to ${paymentStatus}`
    )
  );
});

export {
  createTournament,
  updateTournament,
  deleteTournament,
  getOrganizerTournaments,
  getAllTournaments,
  getTournamentById,
  registerTeamForTournament,
  registerTeamByOrganizer,
  processPayment,
  getTournamentTeams,
  getMyTeams,
  addTournamentWinners,
  addMatchRecord,
  updateMatchRecord,
  deleteMatchRecord,
  updateTeamPaymentStatus
};