import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  CloudSun,
  CloudFog,
} from "lucide-react-native";

interface WeatherPoint {
  pointIndex: number;
  lat: number;
  lon: number;
  etaAt: number;
  conditionCode: string;
  precipProb: number;
  tempCelsius: number;
  windSpeedKmh: number;
  riskScore: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
}

interface TripTimelineProps {
  weatherPoints: WeatherPoint[];
  onPointPress?: (point: WeatherPoint) => void;
}

const RISK_COLORS = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

const conditionIcons: Record<string, React.ComponentType<any>> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  drizzle: CloudRain,
  heavy_rain: CloudRain,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  ice: CloudSnow,
  fog: CloudFog,
};

export function TripTimeline({ weatherPoints, onPointPress }: TripTimelineProps) {
  const colors = useColors();

  if (weatherPoints.length === 0) return null;

  return (
    <View style={styles.container}>
      {weatherPoints.map((point, i) => {
        const IconComponent = conditionIcons[point.conditionCode] ?? Cloud;
        const riskColor = RISK_COLORS[point.riskLevel];
        const isLast = i === weatherPoints.length - 1;
        const time = new Date(point.etaAt).toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <View key={point.pointIndex} style={styles.row}>
            {/* Timeline line */}
            <View style={styles.timelineCol}>
              <View
                style={[styles.dot, { backgroundColor: riskColor }]}
              />
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={[styles.content, { backgroundColor: colors.card }]}>
              <View style={styles.headerRow}>
                <View style={styles.iconRow}>
                  <IconComponent size={18} color={riskColor} />
                  <Text style={[styles.time, { color: colors.mutedForeground }]}>
                    {time}
                  </Text>
                </View>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: riskColor + "20" },
                  ]}
                >
                  <Text style={[styles.riskText, { color: riskColor }]}>
                    {point.riskScore}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <Text style={[styles.detail, { color: colors.text }]}>
                  {Math.round(point.tempCelsius)}°C
                </Text>
                <Text style={[styles.detail, { color: colors.mutedForeground }]}>
                  {point.precipProb}% lluvia
                </Text>
                <Text style={[styles.detail, { color: colors.mutedForeground }]}>
                  {point.windSpeedKmh} km/h
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  timelineCol: {
    width: 20,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 14,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontSize: 13,
    fontWeight: "500",
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detail: {
    fontSize: 13,
  },
});
