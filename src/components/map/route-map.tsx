import React, { useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, Region, PROVIDER_DEFAULT } from "react-native-maps";
import { useColors } from "@/hooks/useColors";
import { decodePolyline, simplifyPolyline, LatLon } from "@/lib/polyline";

interface WeatherMarkerData {
  lat: number;
  lon: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  conditionCode: string;
  pointIndex: number;
}

interface RouteMapProps {
  encodedPolyline?: string;
  weatherMarkers?: WeatherMarkerData[];
  originLat?: number;
  originLon?: number;
  destLat?: number;
  destLon?: number;
  renderWeatherMarker?: (marker: WeatherMarkerData) => React.ReactNode;
  style?: any;
  onMarkerPress?: (marker: WeatherMarkerData) => void;
}

const RISK_COLORS = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

export function RouteMap({
  encodedPolyline,
  weatherMarkers = [],
  originLat,
  originLon,
  destLat,
  destLon,
  renderWeatherMarker,
  style,
  onMarkerPress,
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const colors = useColors();

  const polylinePoints = useMemo(() => {
    if (!encodedPolyline) return [];
    const decoded = decodePolyline(encodedPolyline);
    return simplifyPolyline(decoded, 500);
  }, [encodedPolyline]);

  const coordinates = polylinePoints.map((p) => ({
    latitude: p.lat,
    longitude: p.lon,
  }));

  const initialRegion: Region | undefined = useMemo(() => {
    if (originLat && originLon && destLat && destLon) {
      const midLat = (originLat + destLat) / 2;
      const midLon = (originLon + destLon) / 2;
      const latDelta = Math.abs(originLat - destLat) * 1.5 + 0.1;
      const lonDelta = Math.abs(originLon - destLon) * 1.5 + 0.1;
      return {
        latitude: midLat,
        longitude: midLon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
      };
    }
    if (polylinePoints.length > 0) {
      const lats = polylinePoints.map((p) => p.lat);
      const lons = polylinePoints.map((p) => p.lon);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: (maxLat - minLat) * 1.3 + 0.05,
        longitudeDelta: (maxLon - minLon) * 1.3 + 0.05,
      };
    }
    return undefined;
  }, [originLat, originLon, destLat, destLon, polylinePoints]);

  // Determine the worst risk level for polyline color
  const worstRisk = useMemo(() => {
    if (weatherMarkers.length === 0) return "low" as const;
    const levels = ["low", "moderate", "high", "extreme"] as const;
    let worst = 0;
    for (const m of weatherMarkers) {
      const idx = levels.indexOf(m.riskLevel);
      if (idx > worst) worst = idx;
    }
    return levels[worst];
  }, [weatherMarkers]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        {/* Route polyline */}
        {coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeColor={RISK_COLORS[worstRisk]}
            strokeWidth={4}
          />
        )}

        {/* Origin marker */}
        {originLat && originLon && (
          <Marker
            coordinate={{ latitude: originLat, longitude: originLon }}
            title="Origen"
            pinColor={colors.green}
          />
        )}

        {/* Destination marker */}
        {destLat && destLon && (
          <Marker
            coordinate={{ latitude: destLat, longitude: destLon }}
            title="Destino"
            pinColor={colors.red}
          />
        )}

        {/* Weather markers */}
        {weatherMarkers.map((marker) => (
          <Marker
            key={`weather-${marker.pointIndex}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lon }}
            onPress={() => onMarkerPress?.(marker)}
          >
            {renderWeatherMarker?.(marker)}
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
  },
});
