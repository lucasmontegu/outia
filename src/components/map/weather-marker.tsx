import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  CloudSun,
  CloudFog,
  Wind,
} from "lucide-react-native";

interface WeatherMarkerProps {
  conditionCode: string;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  tempCelsius?: number;
  compact?: boolean;
}

const RISK_COLORS = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

const RISK_BG = {
  low: "#22c55e20",
  moderate: "#eab30820",
  high: "#f9731620",
  extreme: "#ef444420",
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
  haze: CloudFog,
  wind: Wind,
};

export function WeatherMarker({
  conditionCode,
  riskLevel,
  tempCelsius,
  compact = false,
}: WeatherMarkerProps) {
  const IconComponent = conditionIcons[conditionCode] ?? Cloud;
  const color = RISK_COLORS[riskLevel];
  const bg = RISK_BG[riskLevel];

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: bg, borderColor: color }]}>
        <IconComponent size={14} color={color} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: color }]}>
      <IconComponent size={16} color={color} />
      {tempCelsius !== undefined && (
        <Text style={[styles.temp, { color }]}>
          {Math.round(tempCelsius)}°
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  compactContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  temp: {
    fontSize: 12,
    fontWeight: "600",
  },
});
