import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react-native";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo salio mal",
  message = "No pudimos cargar los datos. Intenta de nuevo.",
  onRetry,
}: ErrorStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.red + "20" },
        ]}
      >
        <AlertTriangle size={28} color={colors.red} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Reintentar
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
