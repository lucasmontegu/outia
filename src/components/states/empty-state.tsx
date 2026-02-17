import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {icon}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
