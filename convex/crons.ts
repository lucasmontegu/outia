import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Recalculate weather for active trips every 2 hours
crons.interval(
  "recalculate-active-trips",
  { hours: 2 },
  internal.cronHandlers.recalculateActiveTrips
);

// Update weekly day scores every 6 hours
crons.interval(
  "update-weekly-scores",
  { hours: 6 },
  internal.cronHandlers.updateWeeklyScores
);

export default crons;
