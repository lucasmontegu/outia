import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useTrip(tripId: string) {
  const trip = useQuery(api.trips.get, {
    tripId: tripId as Id<"trips">,
  });

  return {
    trip,
    isLoading: trip === undefined,
    legs: trip?.legs ?? [],
    weatherPoints: trip?.weatherPoints ?? [],
    aiSummary: trip?.aiSummary ?? null,
    departureAnalysis: trip?.departureAnalysis ?? null,
    riskScore: trip?.overallRiskScore ?? null,
    status: trip?.status ?? "planning",
  };
}
