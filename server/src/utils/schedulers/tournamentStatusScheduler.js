import { Tournament } from "../../models/Tournament.model.js";
import { ApiError } from "../ApiError.js";
import cron from "node-cron";

/**
 * Check and update tournament statuses based on their start dates
 * - draft -> open: Draft tournaments are only moved to open when explicitly published by organizers
 * - open -> ongoing: When the current date reaches the tournament's start date
 * - ongoing -> completed: After the tournament has been ongoing for some time (currently set to 24 hours after start)
 */
export const updateTournamentStatuses = async () => {
  try {
    const now = new Date();
    
    // Find open tournaments that should be ongoing (current time >= start time)
    const openToOngoing = await Tournament.find({
      status: "open",
      startDate: { $lte: now }
    });
    
    // Find ongoing tournaments that should be completed 
    // (for simplicity, marking tournaments as completed 24 hours after start time)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ongoingToCompleted = await Tournament.find({
      status: "ongoing",
      startDate: { $lte: oneDayAgo }
    });

    // Update open tournaments to ongoing status
    if (openToOngoing.length > 0) {
      await Tournament.updateMany(
        { _id: { $in: openToOngoing.map(t => t._id) } },
        { $set: { status: "ongoing" } }
      );
      console.log(`Updated ${openToOngoing.length} tournaments from open to ongoing`);
    }

    // Update ongoing tournaments to completed status
    if (ongoingToCompleted.length > 0) {
      await Tournament.updateMany(
        { _id: { $in: ongoingToCompleted.map(t => t._id) } },
        { $set: { status: "completed" } }
      );
      console.log(`Updated ${ongoingToCompleted.length} tournaments from ongoing to completed`);
    }
    
    return {
      openToOngoing: openToOngoing.length,
      ongoingToCompleted: ongoingToCompleted.length
    };
  } catch (error) {
    console.error("Error updating tournament statuses:", error);
    throw new ApiError(500, "Failed to update tournament statuses");
  }
};

// Schedule to run every hour (on the 0th minute)
export const scheduleTournamentStatusUpdates = () => {
  // Run immediately once on server start
  updateTournamentStatuses().catch(err => 
    console.error("Error on initial tournament status update:", err)
  );
  
  // Schedule to run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await updateTournamentStatuses();
      console.log(`Tournament status update at ${new Date().toISOString()}:`, result);
    } catch (error) {
      console.error("Scheduled tournament status update failed:", error);
    }
  });

  console.log("Tournament status update scheduler initialized");
};