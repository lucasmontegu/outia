import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

export function LoadingTrip() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map skeleton */}
      <View
        style={[
          styles.mapSkeleton,
          { backgroundColor: colors.card },
        ]}
      />

      {/* Bottom sheet skeleton */}
      <View style={[styles.sheetSkeleton, { backgroundColor: colors.background }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Summary bar skeleton */}
        <View style={styles.summaryRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.summaryItem}>
              <View
                style={[
                  styles.skeletonLine,
                  { width: 60, height: 20, backgroundColor: colors.card },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { width: 40, height: 12, backgroundColor: colors.card, marginTop: 4 },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Timeline skeleton */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.timelineRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: colors.card },
              ]}
            />
            <View
              style={[
                styles.timelineCard,
                { backgroundColor: colors.card },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSkeleton: {
    flex: 1,
  },
  sheetSkeleton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 16,
    minHeight: 300,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  skeletonLine: {
    borderRadius: 6,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    height: 60,
    borderRadius: 12,
  },
});
