import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Droplets, Wind, Thermometer, AlertTriangle } from "lucide-react-native";

interface SegmentDetailCardProps {
  conditionCode: string;
  tempCelsius: number;
  precipProb: number;
  precipIntensity?: number;
  windSpeedKmh: number;
  riskScore: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  etaAt: number;
  alertType?: string;
}

const RISK_COLORS = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

const CONDITION_LABELS_ES: Record<string, string> = {
  clear: "Despejado",
  partly_cloudy: "Parcialmente nublado",
  cloudy: "Nublado",
  rain: "Lluvia",
  drizzle: "Llovizna",
  heavy_rain: "Lluvia fuerte",
  thunderstorm: "Tormenta",
  snow: "Nieve",
  ice: "Hielo",
  fog: "Niebla",
  haze: "Neblina",
  wind: "Ventoso",
};

export function SegmentDetailCard({
  conditionCode,
  tempCelsius,
  precipProb,
  precipIntensity,
  windSpeedKmh,
  riskScore,
  riskLevel,
  etaAt,
  alertType,
}: SegmentDetailCardProps) {
  const colors = useColors();
  const riskColor = RISK_COLORS[riskLevel];
  const time = new Date(etaAt).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.condition, { color: colors.text }]}>
            {CONDITION_LABELS_ES[conditionCode] ?? conditionCode}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            ETA {time}
          </Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskColor + "20", borderColor: riskColor }]}>
          <Text style={[styles.riskValue, { color: riskColor }]}>{riskScore}</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatItem
          colors={colors}
          icon={<Thermometer size={16} color={colors.blue} />}
          label="Temperatura"
          value={`${Math.round(tempCelsius)}°C`}
        />
        <StatItem
          colors={colors}
          icon={<Droplets size={16} color={colors.blue} />}
          label="Lluvia"
          value={`${precipProb}%`}
        />
        <StatItem
          colors={colors}
          icon={<Wind size={16} color={colors.blue} />}
          label="Viento"
          value={`${windSpeedKmh} km/h`}
        />
        {alertType && (
          <StatItem
            colors={colors}
            icon={<AlertTriangle size={16} color={colors.orange} />}
            label="Alerta"
            value={alertType}
          />
        )}
      </View>
    </View>
  );
}

function StatItem({
  colors,
  icon,
  label,
  value,
}: {
  colors: any;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statItem}>
      {icon}
      <View>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  condition: {
    fontSize: 17,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    marginTop: 2,
  },
  riskBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  riskValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: "40%",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
  },
});
