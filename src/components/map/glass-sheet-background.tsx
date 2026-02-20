/**
 * GlassSheetBackground
 *
 * Background component for @gorhom/bottom-sheet with liquid glass.
 * Uses rounded top corners only.
 */
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { glass, type BlurLevel } from '@/theme/glass-tokens';

// Runtime check for glass effect availability
let isGlassAvailable = false;
try {
  const { isGlassEffectAPIAvailable } = require('expo-glass-effect');
  isGlassAvailable = isGlassEffectAPIAvailable?.() ?? false;
} catch {
  isGlassAvailable = false;
}

interface GlassSheetBackgroundProps extends BottomSheetBackgroundProps {
  tintColor?: string;
  blurLevel?: BlurLevel;
  blurTint?: 'light' | 'dark' | 'default';
}

export function GlassSheetBackground({
  style,
  tintColor = glass.surface.sheet,
  blurLevel = 'L3',
  blurTint = 'dark',
}: GlassSheetBackgroundProps) {
  const blurIntensity = glass.blur[blurLevel];

  const baseStyle = {
    borderTopLeftRadius: glass.radius.md,
    borderTopRightRadius: glass.radius.md,
    borderCurve: 'continuous' as const,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: glass.border.default,
    // Shadow for elevation
    boxShadow: glass.shadow.sheet,
  };

  // iOS 26+ with expo-glass-effect
  if (isGlassAvailable && Platform.OS === 'ios') {
    const { GlassView } = require('expo-glass-effect');
    return (
      <GlassView
        style={[style, baseStyle]}
        glassEffectStyle="regular"
        tintColor={tintColor}
      />
    );
  }

  // iOS fallback with BlurView
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={[style, baseStyle]}
        intensity={blurIntensity}
        tint={blurTint}
      />
    );
  }

  // Android fallback
  return (
    <View
      style={[
        style,
        baseStyle,
        { backgroundColor: tintColor },
      ]}
    />
  );
}

const styles = StyleSheet.create({});
