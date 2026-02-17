import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { MapPin, Plus, Navigation } from "lucide-react-native";

interface Location {
  lat: number;
  lon: number;
  address?: string;
  name?: string;
}

interface RouteInputProps {
  origin: Location | null;
  destination: Location | null;
  stops: Location[];
  onPressOrigin: () => void;
  onPressDestination: () => void;
  onAddStop?: () => void;
}

export function RouteInput({
  origin,
  destination,
  stops,
  onPressOrigin,
  onPressDestination,
  onAddStop,
}: RouteInputProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Origin */}
      <LocationRow
        colors={colors}
        icon={<Navigation size={16} color={colors.green} />}
        label="Origen"
        value={origin?.name ?? origin?.address}
        placeholder="Donde sales?"
        onPress={onPressOrigin}
      />

      {/* Divider with line */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Stops */}
      {stops.map((stop, i) => (
        <React.Fragment key={i}>
          <LocationRow
            colors={colors}
            icon={<MapPin size={16} color={colors.orange} />}
            label={`Parada ${i + 1}`}
            value={stop.name ?? stop.address}
            placeholder="Agregar parada"
            onPress={() => {}}
          />
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
        </React.Fragment>
      ))}

      {/* Destination */}
      <LocationRow
        colors={colors}
        icon={<MapPin size={16} color={colors.red} />}
        label="Destino"
        value={destination?.name ?? destination?.address}
        placeholder="A donde vas?"
        onPress={onPressDestination}
      />

      {/* Add stop button */}
      {onAddStop && (
        <>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={onAddStop}
            style={({ pressed }) => [
              styles.addStopBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Plus size={16} color={colors.blue} />
            <Text style={[styles.addStopText, { color: colors.blue }]}>
              Agregar parada
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function LocationRow({
  colors,
  icon,
  label,
  value,
  placeholder,
  onPress,
}: {
  colors: any;
  icon: React.ReactNode;
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.locationRow,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            { color: value ? colors.text : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  dividerRow: {
    paddingLeft: 28,
    paddingVertical: 4,
  },
  dividerLine: {
    height: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 1,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  addStopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  addStopText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
