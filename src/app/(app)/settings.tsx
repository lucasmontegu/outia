import React from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  User,
  MapPin,
  Bell,
  Thermometer,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { user } = useCurrentUser();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const updatePreferences = useMutation(api.users.updatePreferences);

  const isMetric = user?.preferences?.units !== "imperial";
  const notificationsEnabled = user?.preferences?.notificationsEnabled !== false;

  const handleToggleUnits = async () => {
    await updatePreferences({
      preferences: {
        ...user?.preferences,
        units: isMetric ? "imperial" : "metric",
      },
    });
  };

  const handleToggleNotifications = async () => {
    await updatePreferences({
      preferences: {
        ...user?.preferences,
        notificationsEnabled: !notificationsEnabled,
      },
    });
  };

  const handleSignOut = () => {
    Alert.alert("Cerrar sesion", "Estas seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesion",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 80,
          gap: 24,
        }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.text,
              letterSpacing: -0.3,
            }}
          >
            Ajustes
          </Text>
        </View>

        {/* Profile */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
            }}
          >
            {clerkUser?.imageUrl ? (
              <Image
                source={{ uri: clerkUser.imageUrl }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
              />
            ) : (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={24} color={colors.mutedForeground} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                {clerkUser?.fullName ?? "Usuario"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                }}
              >
                {clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings sections */}
        <View style={{ paddingHorizontal: 24, gap: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            General
          </Text>

          <SettingRow
            colors={colors}
            icon={<MapPin size={18} color={colors.blue} />}
            title="Lugares guardados"
            type="link"
            onPress={() => router.push("/(app)/saved-routes")}
          />

          <SettingRow
            colors={colors}
            icon={<Bell size={18} color={colors.orange} />}
            title="Notificaciones"
            type="toggle"
            value={notificationsEnabled}
            onToggle={handleToggleNotifications}
          />

          <SettingRow
            colors={colors}
            icon={<Thermometer size={18} color={colors.blue} />}
            title="Unidades"
            type="value"
            valueText={isMetric ? "Metrico (°C, km)" : "Imperial (°F, mi)"}
            onPress={handleToggleUnits}
          />
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 24 }}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <LogOut size={18} color={colors.red} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.red,
              }}
            >
              Cerrar sesion
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  colors,
  icon,
  title,
  type,
  value,
  valueText,
  onPress,
  onToggle,
}: {
  colors: any;
  icon: React.ReactNode;
  title: string;
  type: "link" | "toggle" | "value";
  value?: boolean;
  valueText?: string;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
}) {
  return (
    <Pressable
      onPress={type === "toggle" ? undefined : onPress}
      disabled={type === "toggle"}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        opacity: pressed && type !== "toggle" ? 0.7 : 1,
      })}
    >
      {icon}
      <Text
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: "500",
          color: colors.text,
        }}
      >
        {title}
      </Text>
      {type === "toggle" && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ true: colors.blue }}
        />
      )}
      {type === "link" && (
        <ChevronRight size={18} color={colors.mutedForeground} />
      )}
      {type === "value" && (
        <Text
          style={{
            fontSize: 14,
            color: colors.mutedForeground,
          }}
        >
          {valueText}
        </Text>
      )}
    </Pressable>
  );
}
