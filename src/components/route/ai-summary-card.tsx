import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Sparkles, Check } from "lucide-react-native";

interface AiSummaryCardProps {
  recommendation: string;
  reasons: string[];
  confidence: number;
}

export function AiSummaryCard({
  recommendation,
  reasons,
  confidence,
}: AiSummaryCardProps) {
  const colors = useColors();
  const confidencePercent = Math.round(confidence * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.purple + "20" }]}>
          <Sparkles size={16} color={colors.purple} />
        </View>
        <Text style={[styles.headerText, { color: colors.purple }]}>
          Analisis AI
        </Text>
        <View style={[styles.confidenceBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.confidenceText, { color: colors.mutedForeground }]}>
            {confidencePercent}% confianza
          </Text>
        </View>
      </View>

      {/* Recommendation */}
      <Text style={[styles.recommendation, { color: colors.text }]}>
        {recommendation}
      </Text>

      {/* Reasons */}
      {reasons.length > 0 && (
        <View style={styles.reasons}>
          {reasons.map((reason, i) => (
            <View key={i} style={styles.reasonRow}>
              <Check size={14} color={colors.green} />
              <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>
                {reason}
              </Text>
            </View>
          ))}
        </View>
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
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "500",
  },
  recommendation: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  reasons: {
    gap: 6,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
