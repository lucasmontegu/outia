import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AlertTriangle, Bell, Clock, Info } from "lucide-react-native";

interface AlertCardProps {
  type: "high_risk" | "weather_change" | "departure_suggestion" | "rain_imminent" | "system";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  onPress?: () => void;
}

const TYPE_ICONS = {
  high_risk: AlertTriangle,
  weather_change: AlertTriangle,
  departure_suggestion: Clock,
  rain_imminent: Bell,
  system: Info,
};

const SEVERITY_COLORS = {
  info: "#0A84FF",
  warning: "#FF9500",
  critical: "#FF3B30",
};

export function AlertCard({
  type,
  severity,
  title,
  message,
  createdAt,
  isRead,
  onPress,
}: AlertCardProps) {
  const colors = useColors();
  const IconComponent = TYPE_ICONS[type] ?? Bell;
  const accentColor = SEVERITY_COLORS[severity];

  const timeAgo = formatTimeAgo(createdAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          opacity: pressed ? 0.8 : isRead ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: accentColor + "20" }]}>
        <IconComponent size={18} color={accentColor} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {!isRead && <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />}
        </View>
        <Text
          style={[styles.message, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeAgo}
        </Text>
      </View>
    </Pressable>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
  },
});
