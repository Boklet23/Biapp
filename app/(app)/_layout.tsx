import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack, router } from 'expo-router';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { GlobalToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/colors';
import { hasNotificationPermission, registerPushToken, maintainSeasonalReminders } from '@/services/notifications';
import { applyCustomerInfo, initPurchases } from '@/services/subscription';

const isExpoGo = Constants.appOwnership === 'expo';

export default function AppLayout() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!session) return;
    // Be ALDRI om varseltillatelse ved oppstart (før verdi er vist) — kun
    // registrer token + vedlikehold påminnelser hvis tillatelse alt er gitt.
    // Selve prompten eies av ActivationGuide steg 3 etter første kube.
    // maintainSeasonalReminders er idempotent og respekterer brukerens av-valg.
    hasNotificationPermission()
      .then((granted) => {
        if (granted) {
          registerPushToken();
          maintainSeasonalReminders();
        }
      })
      .catch(() => {});
    if (!isExpoGo) {
      initPurchases(session.user.id)
        .then(applyCustomerInfo)
        .catch((err: unknown) => {
          Sentry.captureException(err, { tags: { context: 'tier_sync_startup' } });
          useToastStore.getState().show('Abonnementsstatus kunne ikke synkroniseres', 'error');
        });
    }
    // Avhenger av bruker-id, ikke session-objektet: token-refresh (~hver time)
    // gir nytt objekt med samme id og skal ikke re-kjøre oppstartslogikken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  useEffect(() => {
    if (isExpoGo) return;
    let sub: { remove: () => void } | null = null;
    import('expo-notifications').then(({ addNotificationResponseReceivedListener, getLastNotificationResponseAsync }) => {
      const handleResponse = (response: { notification: { request: { content: { data?: Record<string, unknown> } } } }) => {
        const data = response.notification.request.content.data;
        const hiveId = typeof data?.hiveId === 'string' ? data.hiveId : undefined;
        const eventId = typeof data?.eventId === 'string' ? data.eventId : undefined;
        if (hiveId) {
          router.push(`/(app)/(tabs)/kuber/${hiveId}` as any);
        } else if (eventId) {
          router.push('/(app)/(tabs)/kalender' as any);
        }
      };
      // Kald start: appen ble åpnet ved trykk på et varsel før listeneren fantes
      getLastNotificationResponseAsync()
        .then((response) => { if (response) handleResponse(response); })
        .catch(() => {});
      sub = addNotificationResponseReceivedListener(handleResponse);
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
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
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
