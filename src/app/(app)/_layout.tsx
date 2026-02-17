import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs, useSegments } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import { View, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Home, Bell, Settings } from "lucide-react-native";

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const { user, isLoading, isOnboarded } = useCurrentUser();
  const colors = useColors();
  const unreadCount = useQuery(api.alerts.unreadCount);
  const segments = useSegments();

  // Register for push notifications
  useNotifications();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  // Only redirect to paywall if not already on it (prevents infinite loop)
  const isOnPaywall = segments[segments.length - 1] === "paywall";
  if (user && !isOnboarded && !isOnPaywall) {
    return <Redirect href="/(app)/paywall" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} />
          ),
          tabBarBadge: unreadCount && unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="saved-routes"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="route/[tripId]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="paywall"
        options={{ href: null }}
      />
    </Tabs>
  );
}
