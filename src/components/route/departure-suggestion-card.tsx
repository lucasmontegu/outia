import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Clock, ArrowDown } from "lucide-react-native";

interface DepartureSuggestionCardProps {
  recommendation: string;
  bestWindow?: {
    startHour: number;
    endHour: number;
    riskReduction: number;
  };
  onChangeDeparture?: () => void;
}

export function DepartureSuggestionCard({
  recommendation,
  bestWindow,
  onChangeDeparture,
}: DepartureSuggestionCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.blue + "10" }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.blue + "20" }]}>
          <Clock size={16} color={colors.blue} />
        </View>
        <Text style={[styles.headerText, { color: colors.blue }]}>
          Sugerencia de salida
        </Text>
      </View>

      <Text style={[styles.recommendation, { color: colors.text }]}>
        {recommendation}
      </Text>

      {bestWindow && (
        <View style={[styles.windowBadge, { backgroundColor: colors.green + "20" }]}>
          <ArrowDown size={14} color={colors.green} />
          <Text style={[styles.windowText, { color: colors.green }]}>
            {bestWindow.riskReduction}% menos riesgo saliendo entre{" "}
            {bestWindow.startHour}:00 - {bestWindow.endHour}:00
          </Text>
        </View>
      )}

      {onChangeDeparture && (
        <Pressable
          onPress={onChangeDeparture}
          style={[styles.changeBtn, { backgroundColor: colors.blue }]}
        >
          <Text style={[styles.changeBtnText, { color: "#fff" }]}>
            Cambiar hora de salida
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  recommendation: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  windowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  windowText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  changeBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  changeBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
