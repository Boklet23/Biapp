import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, router, Stack } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/auth';
import { GlobalToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/colors';
import { requestNotificationPermission, registerPushToken } from '@/services/notifications';

const isExpoGo = Constants.appOwnership === 'expo';

export default function AppLayout() {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (session) {
      requestNotificationPermission();
      registerPushToken();
    }
  }, [session]);

  useEffect(() => {
    if (isExpoGo) return;
    let sub: { remove: () => void } | null = null;
    import('expo-notifications').then(({ addNotificationResponseReceivedListener }) => {
      sub = addNotificationResponseReceivedListener((response) => {
        const eventId = response.notification.request.content.data?.eventId as string | undefined;
        if (eventId) {
          router.push('/(app)/(tabs)/kalender' as any);
        }
      });
    });
    return () => { sub?.remove(); };
  }, []);

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
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
