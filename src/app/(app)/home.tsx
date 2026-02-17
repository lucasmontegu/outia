import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTripPlanner } from "@/hooks/useTripPlanner";
import { WeeklyStrip } from "@/components/planner/weekly-strip";
import { RouteInput } from "@/components/planner/route-input";
import { PlaceSearchInput, type PlaceResult } from "@/components/place-search-input";
import { Button } from "@/components/ui/button";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";
import { Calendar, Clock, Settings, ArrowLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function HomeScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const weeklyScores = useQuery(api.tripDailyScoresQueries.getWeeklyScores);
  const activeTrips = useQuery(api.trips.listActive);

  const planner = useTripPlanner();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestSearch, setShowDestSearch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");

  // When a day is selected on the WeeklyStrip, update the departure date
  const handleDaySelect = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr);
      const newDate = new Date(dateStr + "T12:00:00");
      // Find the score for this day to use bestDepartureHour if available
      const dayScore = weeklyScores?.find((s) => s.date === dateStr);
      if (dayScore?.bestDepartureHour != null) {
        newDate.setHours(dayScore.bestDepartureHour, 0, 0, 0);
      } else {
        // Preserve current departure time, just change the date
        const current = planner.departureDate;
        newDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
      }
      // Ensure departure is in the future
      if (newDate.getTime() < Date.now()) {
        newDate.setTime(Date.now() + 30 * 60 * 1000);
      }
      planner.setDepartureDate(newDate);
    },
    [weeklyScores, planner]
  );

  const firstName = user?.firstName ?? "viajero";

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos dias" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          gap: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                fontWeight: "500",
              }}
            >
              {greeting}
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.text,
                letterSpacing: -0.3,
              }}
            >
              {firstName}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/settings")}
            hitSlop={12}
          >
            <Settings size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Active trip banner */}
        {activeTrips && activeTrips.length > 0 && (
          <Pressable
            onPress={() =>
              router.push(`/(app)/route/${activeTrips[0]._id}`)
            }
            style={{
              marginHorizontal: 24,
              backgroundColor: colors.blue + "15",
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.blue + "30",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={18} color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                Viaje activo
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                {activeTrips[0].origin.address ?? "Origen"} →{" "}
                {activeTrips[0].destination.address ?? "Destino"}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Weekly strip */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.text,
              paddingHorizontal: 24,
            }}
          >
            Esta semana
          </Text>
          <WeeklyStrip
            scores={
              weeklyScores ?? Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                return {
                  date: d.toISOString().split("T")[0],
                  overallScore: null,
                  bestDepartureHour: null,
                };
              })
            }
            selectedDate={selectedDate}
            onSelectDate={handleDaySelect}
          />
        </View>

        {/* Route Input */}
        <View style={{ paddingHorizontal: 24, gap: 12 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Planifica tu ruta
          </Text>

          <RouteInput
            origin={planner.origin}
            destination={planner.destination}
            stops={planner.stops}
            onPressOrigin={() => setShowOriginSearch(true)}
            onPressDestination={() => setShowDestSearch(true)}
            onAddStop={() => {}}
          />

          {/* Departure time */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
            }}
            onPress={() => {
              setDatePickerMode("date");
              setShowDatePicker(true);
            }}
          >
            <Clock size={18} color={colors.blue} />
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Salida
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: colors.text,
                }}
              >
                {planner.departureDate.toLocaleDateString("es", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                {planner.departureDate.toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={planner.departureDate}
              mode={datePickerMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (event.type === "dismissed") {
                  setShowDatePicker(false);
                  return;
                }
                if (selectedDate) {
                  if (datePickerMode === "date") {
                    // After picking date, switch to time picker
                    const updated = new Date(selectedDate);
                    updated.setHours(
                      planner.departureDate.getHours(),
                      planner.departureDate.getMinutes(),
                      0,
                      0
                    );
                    planner.setDepartureDate(updated);
                    setDatePickerMode("time");
                    // On Android, the picker closes between modes
                    if (Platform.OS === "android") {
                      setShowDatePicker(true);
                    }
                  } else {
                    // Time picked — finalize
                    planner.setDepartureDate(selectedDate);
                    setShowDatePicker(false);
                  }
                  // Sync the WeeklyStrip selection
                  const dateStr = (selectedDate ?? planner.departureDate)
                    .toISOString()
                    .split("T")[0];
                  setSelectedDate(dateStr);
                }
              }}
            />
          )}
        </View>

        {/* Plan trip button */}
        <View style={{ paddingHorizontal: 24 }}>
          <Button
            onPress={planner.planTrip}
            disabled={!planner.canPlanTrip}
            loading={planner.isCreating}
          >
            Planificar viaje
          </Button>
        </View>

        {/* Saved routes quick access */}
        {planner.savedPlaces && planner.savedPlaces.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.text,
                paddingHorizontal: 24,
              }}
            >
              Lugares guardados
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                gap: 10,
              }}
            >
              {planner.savedPlaces.map((place) => (
                <Pressable
                  key={place._id}
                  onPress={() => {
                    planner.setDestination({
                      lat: place.lat,
                      lon: place.lon,
                      address: place.address,
                      name: place.name,
                    });
                  }}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    minWidth: 100,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {place.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {place.type === "home"
                      ? "Hogar"
                      : place.type === "work"
                        ? "Trabajo"
                        : "Favorito"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Place search modal */}
      <Modal
        visible={showOriginSearch || showDestSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowOriginSearch(false);
          setShowDestSearch(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                setShowOriginSearch(false);
                setShowDestSearch(false);
              }}
              hitSlop={12}
            >
              <ArrowLeft size={24} color={colors.text} />
            </Pressable>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {showOriginSearch ? "Elegir origen" : "Elegir destino"}
            </Text>
          </View>

          <PlaceSearchInput
            placeholder={
              showOriginSearch ? "Donde sales?" : "A donde vas?"
            }
            autoFocus
            onSelect={(place: PlaceResult) => {
              if (showOriginSearch) {
                planner.setOrigin({
                  lat: place.lat,
                  lon: place.lon,
                  address: place.address,
                  name: place.name,
                });
                setShowOriginSearch(false);
              } else {
                planner.setDestination({
                  lat: place.lat,
                  lon: place.lon,
                  address: place.address,
                  name: place.name,
                });
                setShowDestSearch(false);
              }
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
