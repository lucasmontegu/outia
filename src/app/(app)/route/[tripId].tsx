import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useColors } from "@/hooks/useColors";
import { useTrip } from "@/hooks/useTrip";
import { RouteMap } from "@/components/map/route-map";
import { WeatherMarker } from "@/components/map/weather-marker";
import { RiskScoreBadge } from "@/components/route/risk-score-badge";
import { TripTimeline } from "@/components/route/trip-timeline";
import { SegmentDetailCard } from "@/components/route/segment-detail-card";
import { AiSummaryCard } from "@/components/route/ai-summary-card";
import { DepartureSuggestionCard } from "@/components/route/departure-suggestion-card";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft, Share2 } from "lucide-react-native";

export default function RouteScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const { trip, isLoading, weatherPoints, riskScore, status, aiSummary, departureAnalysis } = useTrip(
    tripId!
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "45%", "85%"], []);

  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const selectedWeatherPoint = useMemo(
    () =>
      selectedPoint !== null
        ? weatherPoints.find((p) => p.pointIndex === selectedPoint) ?? null
        : null,
    [selectedPoint, weatherPoints]
  );

  const retryPipeline = useMutation(api.trips.updateDeparture);

  if (isLoading || !trip) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
        <Text
          style={{
            color: colors.mutedForeground,
            marginTop: 12,
            fontSize: 15,
          }}
        >
          Cargando viaje...
        </Text>
      </View>
    );
  }

  // Pipeline still running or failed — show processing state
  if (trip.status === "planning") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Calculando ruta y clima...
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Esto puede tardar unos segundos
        </Text>
        <Pressable
          onPress={() => {
            // Re-trigger pipeline by updating departure to same time (or +5min if past)
            const minDeparture = Date.now() + 5 * 60 * 1000;
            retryPipeline({
              tripId: trip._id,
              departureAt: Math.max(trip.departureAt, minDeparture),
            });
          }}
          style={{
            marginTop: 8,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: colors.card,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: colors.blue, fontSize: 15, fontWeight: "600" }}>
            Reintentar
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.mutedForeground, fontSize: 14, marginTop: 4 }}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  const weatherMarkers = weatherPoints.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    riskLevel: p.riskLevel,
    conditionCode: p.conditionCode,
    pointIndex: p.pointIndex,
  }));

  const departureTime = new Date(trip.departureAt).toLocaleString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationHours = trip.totalDurationSeconds
    ? Math.floor(trip.totalDurationSeconds / 3600)
    : 0;
  const durationMins = trip.totalDurationSeconds
    ? Math.floor((trip.totalDurationSeconds % 3600) / 60)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Map */}
      <RouteMap
        encodedPolyline={trip.encodedPolyline}
        weatherMarkers={weatherMarkers}
        originLat={trip.origin.lat}
        originLon={trip.origin.lon}
        destLat={trip.destination.lat}
        destLon={trip.destination.lon}
        renderWeatherMarker={(marker) => (
          <WeatherMarker
            conditionCode={marker.conditionCode}
            riskLevel={marker.riskLevel}
            compact
          />
        )}
        onMarkerPress={(marker) => {
          setSelectedPoint(marker.pointIndex);
          bottomSheetRef.current?.snapToIndex(1);
        }}
        style={{ flex: 1 }}
      />

      {/* Floating header */}
      <View
        style={[
          styles.floatingHeader,
          {
            top: insets.top + 8,
            backgroundColor: colors.background + "E6",
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          hitSlop={12}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {trip.origin.address?.split(",")[0] ?? "Origen"} →{" "}
            {trip.destination.address?.split(",")[0] ?? "Destino"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {departureTime}
          </Text>
        </View>

        <Pressable style={styles.headerBtn} hitSlop={12}>
          <Share2 size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Risk badge floating */}
      {riskScore !== null && (
        <View
          style={[
            styles.floatingRisk,
            { top: insets.top + 72 },
          ]}
        >
          <RiskScoreBadge score={riskScore} size="md" />
        </View>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
            gap: 16,
          }}
        >
          {/* Trip summary bar */}
          <View style={[styles.summaryBar, { paddingHorizontal: 20 }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {trip.totalDistanceKm
                  ? `${Math.round(trip.totalDistanceKm)} km`
                  : "--"}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.mutedForeground }]}
              >
                Distancia
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {durationHours > 0
                  ? `${durationHours}h ${durationMins}m`
                  : `${durationMins}m`}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.mutedForeground }]}
              >
                Duracion
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {weatherPoints.length}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.mutedForeground }]}
              >
                Puntos clima
              </Text>
            </View>
          </View>

          {/* AI Summary */}
          {aiSummary && (
            <View style={{ paddingHorizontal: 20 }}>
              <AiSummaryCard
                recommendation={aiSummary.recommendation}
                reasons={aiSummary.reasons}
                confidence={aiSummary.confidence}
              />
            </View>
          )}

          {/* Departure Suggestion */}
          {departureAnalysis && (
            <View style={{ paddingHorizontal: 20 }}>
              <DepartureSuggestionCard
                recommendation={departureAnalysis.recommendation}
                bestWindow={departureAnalysis.bestDepartureWindow ?? undefined}
                onChangeDeparture={() => {
                  if (!trip || !departureAnalysis.bestDepartureWindow) return;
                  const bestHour = departureAnalysis.bestDepartureWindow.startHour;
                  const departure = new Date(trip.departureAt);
                  departure.setHours(bestHour, 0, 0, 0);
                  retryPipeline({
                    tripId: trip._id,
                    departureAt: departure.getTime(),
                  });
                }}
              />
            </View>
          )}

          {/* Selected point detail */}
          {selectedWeatherPoint && (
            <View style={{ paddingHorizontal: 20 }}>
              <SegmentDetailCard
                conditionCode={selectedWeatherPoint.conditionCode}
                tempCelsius={selectedWeatherPoint.tempCelsius}
                precipProb={selectedWeatherPoint.precipProb}
                precipIntensity={selectedWeatherPoint.precipIntensity ?? undefined}
                windSpeedKmh={selectedWeatherPoint.windSpeedKmh}
                riskScore={selectedWeatherPoint.riskScore}
                riskLevel={selectedWeatherPoint.riskLevel}
                etaAt={selectedWeatherPoint.etaAt}
                alertType={selectedWeatherPoint.alertType ?? undefined}
              />
            </View>
          )}

          {/* Timeline */}
          <View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.text,
                paddingHorizontal: 20,
                marginBottom: 8,
              }}
            >
              Timeline del viaje
            </Text>
            <TripTimeline
              weatherPoints={weatherPoints}
              onPointPress={(p) => setSelectedPoint(p.pointIndex)}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  floatingRisk: {
    position: "absolute",
    right: 20,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "600",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
});
