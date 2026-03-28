import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function LaerLayout() {
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
      <Stack.Screen name="[slug]" options={{ title: 'Sykdom' }} />
      <Stack.Screen name="guide/[slug]" options={{ title: 'Guide' }} />
    </Stack>
  );
}
