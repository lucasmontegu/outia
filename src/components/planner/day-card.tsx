import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface DayCardProps {
  dayName: string; // "Lun", "Mar", etc.
  dayNumber: number; // 1-31
  score: number | null; // 0-100, null = no data
  isToday?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#a1a1aa";
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

export function DayCard({
  dayName,
  dayNumber,
  score,
  isToday = false,
  isSelected = false,
  onPress,
}: DayCardProps) {
  const colors = useColors();
  const scoreColor = getScoreColor(score);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? colors.primary : colors.card,
          opacity: pressed ? 0.8 : 1,
          borderWidth: isToday && !isSelected ? 1.5 : 0,
          borderColor: colors.blue,
        },
      ]}
    >
      <Text
        style={[
          styles.dayName,
          { color: isSelected ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {dayName}
      </Text>

      <Text
        style={[
          styles.dayNumber,
          { color: isSelected ? colors.primaryForeground : colors.text },
        ]}
      >
        {dayNumber}
      </Text>

      {/* Score dot */}
      <View
        style={[
          styles.scoreDot,
          { backgroundColor: scoreColor },
        ]}
      />

      {score !== null && (
        <Text
          style={[
            styles.scoreText,
            { color: isSelected ? colors.primaryForeground : scoreColor },
          ]}
        >
          {score}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    gap: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600",
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
