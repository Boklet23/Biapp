import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function FeedLayout() {
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
      <Stack.Screen name="ny" options={{ title: 'Nytt innlegg', presentation: 'modal' }} />
    </Stack>
  );
}
