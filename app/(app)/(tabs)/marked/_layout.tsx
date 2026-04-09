import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function MarkedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.light },
        headerTintColor: Colors.honey,
        headerTitleStyle: { fontWeight: '700', color: Colors.dark },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ny" options={{ title: 'Ny annonse', presentation: 'modal' }} />
      <Stack.Screen name="[listingId]/index" options={{ title: 'Annonse' }} />
    </Stack>
  );
}
