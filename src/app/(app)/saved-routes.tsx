import React from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MapPin, Trash2, ChevronRight } from "lucide-react-native";

export default function SavedRoutesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const routes = useQuery(api.savedRoutes.list);
  const removeRoute = useMutation(api.savedRoutes.remove);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Eliminar ruta", `Eliminar "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeRoute({ id: id as any }),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: 12,
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
          Rutas guardadas
        </Text>
      </View>

      <FlatList
        data={routes ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
          gap: 8,
        }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              gap: 12,
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => {
              // Use this route to pre-fill planner
              router.push("/(app)/home");
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.blue + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={18} color={colors.blue} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {item.origin.address?.split(",")[0] ?? "Origen"} →{" "}
                {item.destination.address?.split(",")[0] ?? "Destino"}
              </Text>
            </View>

            <Pressable
              onPress={() => handleDelete(item._id, item.name)}
              hitSlop={12}
              style={{ padding: 4 }}
            >
              <Trash2 size={18} color={colors.mutedForeground} />
            </Pressable>
          </Pressable>
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
              Sin rutas guardadas
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              Guarda tus rutas frecuentes{"\n"}para planificar mas rapido.
            </Text>
          </View>
        }
      />
    </View>
  );
}
