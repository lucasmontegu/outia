/**
 * RouteActionBar
 *
 * Bottom action bar for route preview with Timeline, Go Now, and More buttons.
 */
import React from 'react';
import { Pressable, Text, View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { glass } from '@/theme/glass-tokens';
import { useColors } from '@/hooks/useColors';

interface RouteActionBarProps {
  onGoNow: () => void;
  onTimeline: () => void;
  onMore: () => void;
  isLoading?: boolean;
  isTimelineDisabled?: boolean;
}

export function RouteActionBar({
  onGoNow,
  onTimeline,
  onMore,
  isLoading,
  isTimelineDisabled,
}: RouteActionBarProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInUp.duration(glass.animation.default)}
      exiting={FadeOutDown.duration(glass.animation.fast)}
      style={styles.container}
    >
      {/* Timeline Button - Glass Pill */}
      <Pressable
        onPress={onTimeline}
        disabled={isTimelineDisabled}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <AdaptiveGlass
          blurLevel="L2"
          borderRadius={glass.radius.pill}
          showBorder
          style={[
            styles.secondaryButton,
            isTimelineDisabled && styles.disabled,
          ]}
        >
          <Image
            source={Platform.OS === 'ios' ? 'sf:list.bullet' : 'list'}
            style={[styles.buttonIcon, { tintColor: colors.text }]}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Timeline
          </Text>
        </AdaptiveGlass>
      </Pressable>

      {/* Go Now Button - Solid Blue CTA */}
      <Pressable
        onPress={onGoNow}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Image
              source={Platform.OS === 'ios' ? 'sf:location.fill' : 'navigation'}
              style={[styles.buttonIcon, { tintColor: '#FFFFFF' }]}
            />
            <Text style={styles.primaryButtonText}>Ir ahora</Text>
          </>
        )}
      </Pressable>

      {/* More Button - Glass Circle */}
      <Pressable
        onPress={onMore}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <AdaptiveGlass
          blurLevel="L2"
          borderRadius={24}
          showBorder
          style={styles.moreButton}
        >
          <Image
            source={Platform.OS === 'ios' ? 'sf:ellipsis' : 'more'}
            style={[styles.buttonIcon, { tintColor: colors.text }]}
          />
        </AdaptiveGlass>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: glass.radius.pill,
    borderCurve: 'continuous',
  },
  moreButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 18,
    height: 18,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
