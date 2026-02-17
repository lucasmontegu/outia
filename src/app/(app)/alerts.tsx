import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCard } from "@/components/alerts/alert-card";
import { router } from "expo-router";
import { CheckCheck } from "lucide-react-native";

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const alerts = useQuery(api.alerts.listByUser);
  const markRead = useMutation(api.alerts.markRead);
  const markAllRead = useMutation(api.alerts.markAllRead);

  const hasUnread = alerts?.some((a) => !a.readAt) ?? false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          Alertas
        </Text>
        {hasUnread && (
          <Pressable
            onPress={() => markAllRead({})}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <CheckCheck size={16} color={colors.blue} />
            <Text style={{ fontSize: 14, color: colors.blue, fontWeight: "500" }}>
              Marcar todas
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={alerts ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
          gap: 8,
        }}
        renderItem={({ item }) => (
          <AlertCard
            type={item.type}
            severity={item.severity}
            title={item.title}
            message={item.message}
            createdAt={item._creationTime}
            isRead={!!item.readAt}
            onPress={() => {
              markRead({ alertId: item._id });
              if (item.tripId) {
                router.push(`/(app)/route/${item.tripId}`);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 100,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Sin alertas
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              Las alertas de clima en tu ruta{"\n"}aparecerán aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}
