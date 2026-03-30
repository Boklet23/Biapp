import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth';
import { GlobalToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/colors';
import { requestNotificationPermission, registerPushToken } from '@/services/notifications';

export default function AppLayout() {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (session) {
      requestNotificationPermission();
      registerPushToken();
    }
  }, [session]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const eventId = response.notification.request.content.data?.eventId as string | undefined;
      if (eventId) {
        router.push('/(app)/(tabs)/kalender' as any);
      }
    });
    return () => sub.remove();
  }, []);

  if (isLoading) return null;

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profil"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Profil',
            headerStyle: { backgroundColor: Colors.light },
            headerTitleStyle: { fontWeight: '700', color: Colors.dark },
            headerShadowVisible: false,
            headerTintColor: Colors.honey,
          }}
        />
      </Stack>
      <GlobalToast />
    </View>
  );
}
