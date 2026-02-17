import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/theme/colors';

/**
 * Returns the full color palette for the current theme.
 * Use this when you need multiple colors in a component.
 * For a single color, prefer useColor('colorName').
 */
export function useColors() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
}
