import { Colors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ColorKey = keyof typeof Colors.dark;

/**
 * Returns the full colors object for the current color scheme.
 * Use when you need multiple colors (3+).
 */
export function useColors() {
  const scheme = useColorScheme() ?? 'dark';
  return Colors[scheme];
}

/**
 * Returns a single color value for the current color scheme.
 * Use when you need only 1-2 colors.
 */
export function useColor(colorName: ColorKey): string {
  const scheme = useColorScheme() ?? 'dark';
  return Colors[scheme][colorName];
}
