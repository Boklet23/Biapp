import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function KuberLayout() {
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
      <Stack.Screen name="ny" options={{ title: 'Ny kube', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: '' }} />
      <Stack.Screen name="[id]/rediger" options={{ title: 'Rediger kube', presentation: 'modal' }} />
      <Stack.Screen name="[id]/inspeksjon/ny" options={{ title: 'Ny inspeksjon' }} />
      <Stack.Screen name="[id]/inspeksjon/[inspId]" options={{ title: 'Inspeksjon' }} />
    </Stack>
  );
}
