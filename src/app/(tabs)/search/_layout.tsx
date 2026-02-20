import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

function SearchLayoutContent() {
  const theme = useColorScheme();
  const text = useColor('text');
  const background = useColor('background');
  const [searchText, setSearchText] = useState('');

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTintColor: text,
        headerBlurEffect: isLiquidGlassAvailable()
          ? undefined
          : theme === 'dark'
          ? 'systemMaterialDark'
          : 'systemMaterialLight',
        headerStyle: {
          backgroundColor: isLiquidGlassAvailable()
            ? 'transparent'
            : background,
        },
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Search',
          headerTitle: () =>
            Platform.OS === 'android' ? (
              <Text variant='heading'>Search</Text>
            ) : undefined,
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: 'Search',
            onChangeText: (event) => {
              setSearchText(event.nativeEvent.text);
            },
          },
        }}
      />
    </Stack>
  );
}

export default function SearchLayout() {
  return (
    <>
      <SearchLayoutContent />
    </>
  );
}
