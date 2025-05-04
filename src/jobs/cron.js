import cron from "node-cron";
import { runElectionStatusUpdater } from "../cron/electionStatusUpdater.js";

export const startCronJobs = () => {
    cron.schedule("* * * * *", async () => {
        await runElectionStatusUpdater();
    });

    console.log("⏰ Cron jobs initialized.");
};

