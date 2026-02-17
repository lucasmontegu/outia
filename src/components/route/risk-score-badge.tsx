import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface RiskScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const RISK_COLORS = {
  low: { bg: "#22c55e20", text: "#22c55e", border: "#22c55e" },
  moderate: { bg: "#eab30820", text: "#eab308", border: "#eab308" },
  high: { bg: "#f9731620", text: "#f97316", border: "#f97316" },
  extreme: { bg: "#ef444420", text: "#ef4444", border: "#ef4444" },
};

function getLevel(score: number) {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "extreme";
}

const SIZES = {
  sm: { size: 40, fontSize: 14, labelSize: 9 },
  md: { size: 56, fontSize: 20, labelSize: 10 },
  lg: { size: 72, fontSize: 26, labelSize: 11 },
};

const LABELS_ES: Record<string, string> = {
  low: "Bajo",
  moderate: "Moderado",
  high: "Alto",
  extreme: "Extremo",
};

export function RiskScoreBadge({ score, size = "md" }: RiskScoreBadgeProps) {
  const level = getLevel(score);
  const colors = RISK_COLORS[level];
  const dims = SIZES[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: dims.size,
          height: dims.size,
          borderRadius: dims.size / 2,
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.score, { fontSize: dims.fontSize, color: colors.text }]}>
        {score}
      </Text>
      {size !== "sm" && (
        <Text style={[styles.label, { fontSize: dims.labelSize, color: colors.text }]}>
          {LABELS_ES[level]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  score: {
    fontWeight: "700",
  },
  label: {
    fontWeight: "600",
    marginTop: -2,
  },
});
