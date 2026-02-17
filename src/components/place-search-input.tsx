import { useColors } from "@/hooks/useColors";
import { BORDER_RADIUS, HEIGHT } from "@/theme/globals";
import { MapPin, Search, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  View,
  Text,
} from "react-native";

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
}

interface PlaceSearchInputProps {
  placeholder?: string;
  onSelect: (place: PlaceResult) => void;
  value?: string;
  autoFocus?: boolean;
}

export function PlaceSearchInput({
  placeholder = "Buscar lugar...",
  onSelect,
  value,
  autoFocus,
}: PlaceSearchInputProps) {
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<TextInput>(null);

  const colors = useColors();

  const searchPlaces = useCallback(async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Google Places Autocomplete API
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY not set");
        setLoading(false);
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&types=geocode|establishment&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.predictions) {
        const places: PlaceResult[] = await Promise.all(
          data.predictions.slice(0, 5).map(async (p: any) => {
            // Get place details for lat/lon
            const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry,name&key=${apiKey}`;
            const detailRes = await fetch(detailUrl);
            const detail = await detailRes.json();
            const loc = detail.result?.geometry?.location;

            return {
              placeId: p.place_id,
              name: p.structured_formatting?.main_text ?? p.description,
              address: p.description,
              lat: loc?.lat ?? 0,
              lon: loc?.lng ?? 0,
            };
          })
        );
        setResults(places);
      }
    } catch (err) {
      console.error("Place search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    setShowResults(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(text), 300);
  };

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setShowResults(false);
    onSelect(place);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: BORDER_RADIUS,
          height: HEIGHT,
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        <Search size={18} color={colors.mutedForeground} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
          }}
          onFocus={() => query.length >= 3 && setShowResults(true)}
        />
        {loading && <ActivityIndicator size="small" color={colors.blue} />}
        {query.length > 0 && !loading && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {showResults && results.length > 0 && (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            marginTop: 4,
            overflow: "hidden",
          }}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.placeId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  gap: 12,
                  backgroundColor: pressed
                    ? colors.muted
                    : "transparent",
                })}
              >
                <MapPin size={16} color={colors.blue} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.text,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.mutedForeground,
                      marginTop: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
