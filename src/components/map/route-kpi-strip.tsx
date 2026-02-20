/**
 * RouteKpiStrip
 *
 * Compact chip showing route distance and ETA.
 * Positioned at top-right of map during route preview.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { glass } from '@/theme/glass-tokens';
import { useColors } from '@/hooks/useColors';

interface RouteKpiStripProps {
  distance?: string;  // "45 km"
  eta?: string;       // "52 min"
}

export function RouteKpiStrip({ distance, eta }: RouteKpiStripProps) {
  const colors = useColors();

  if (!distance && !eta) return null;

  return (
    <Animated.View
      entering={FadeInRight.duration(glass.animation.default)}
      exiting={FadeOutRight.duration(glass.animation.fast)}
    >
      <AdaptiveGlass
        blurLevel="L2"
        borderRadius={glass.radius.md}
        showBorder
        style={styles.container}
      >
        {distance && (
          <Text style={[styles.value, { color: colors.text }]}>
            {distance}
          </Text>
        )}
        {eta && (
          <Text style={[styles.value, { color: colors.primary }]}>
            {eta}
          </Text>
        )}
      </AdaptiveGlass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
