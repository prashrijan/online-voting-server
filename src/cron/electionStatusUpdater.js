import { Election } from "../models/election.model.js";

export const runElectionStatusUpdater = async () => {
    try {
        console.log("🔄 Running election status update cron job...");
        await Election.updateElectionStatus();
        console.log("✅ Election status update complete.");
    } catch (err) {
        console.error("❌ Error updating election statuses:", err);
    }
};
