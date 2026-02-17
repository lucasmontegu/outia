import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { router } from "expo-router";

interface Location {
  lat: number;
  lon: number;
  address?: string;
  name?: string;
  placeId?: string;
}

export function useTripPlanner() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [stops, setStops] = useState<Location[]>([]);
  // Default departure 30 min from now so it's always in the future
  const [departureDate, setDepartureDate] = useState<Date>(
    () => new Date(Date.now() + 30 * 60 * 1000)
  );
  const [isCreating, setIsCreating] = useState(false);

  const createTrip = useMutation(api.trips.create);
  const savedPlaces = useQuery(api.savedPlaces.list);

  const setOriginFromPlace = useCallback(
    (place: { lat: number; lon: number; address: string; name: string; placeId?: string }) => {
      setOrigin({
        lat: place.lat,
        lon: place.lon,
        address: place.address,
        name: place.name,
        placeId: place.placeId,
      });
    },
    []
  );

  const setDestinationFromPlace = useCallback(
    (place: { lat: number; lon: number; address: string; name: string; placeId?: string }) => {
      setDestination({
        lat: place.lat,
        lon: place.lon,
        address: place.address,
        name: place.name,
        placeId: place.placeId,
      });
    },
    []
  );

  const addStop = useCallback(
    (place: { lat: number; lon: number; address: string; name: string }) => {
      setStops((prev) => [...prev, place]);
    },
    []
  );

  const removeStop = useCallback((index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const canPlanTrip = origin !== null && destination !== null;

  const planTrip = useCallback(async () => {
    if (!origin || !destination) return;

    setIsCreating(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const tripId = await createTrip({
        origin: {
          lat: origin.lat,
          lon: origin.lon,
          address: origin.address,
          placeId: origin.placeId,
        },
        destination: {
          lat: destination.lat,
          lon: destination.lon,
          address: destination.address,
          placeId: destination.placeId,
        },
        stops: stops.map((s) => ({
          lat: s.lat,
          lon: s.lon,
          address: s.address,
          placeId: s.placeId,
        })),
        departureAt: departureDate.getTime(),
        timezone,
      });

      router.push(`/(app)/route/${tripId}`);
    } catch (err) {
      console.error("Failed to create trip:", err);
    } finally {
      setIsCreating(false);
    }
  }, [origin, destination, stops, departureDate, createTrip]);

  const reset = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setStops([]);
    setDepartureDate(new Date());
  }, []);

  return {
    origin,
    destination,
    stops,
    departureDate,
    isCreating,
    canPlanTrip,
    savedPlaces,
    setOrigin: setOriginFromPlace,
    setDestination: setDestinationFromPlace,
    setDepartureDate,
    addStop,
    removeStop,
    planTrip,
    reset,
  };
}
