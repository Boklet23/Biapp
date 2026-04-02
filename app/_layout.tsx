import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { fetchProfile } from '@/services/profile';
import { initPurchases, mapEntitlementToTier, syncTierToSupabase } from '@/services/subscription';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  enableLogs: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { setSession, setProfile } = useAuthStore();

  useEffect(() => {
    // Resolve isLoading immediately using getSession — don't wait for onAuthStateChange
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          fetchProfile().then((profile) => {
            setProfile(profile);
            // Init RevenueCat and sync subscription tier
            initPurchases(session.user.id).then(async (info) => {
              const tier = mapEntitlementToTier(info);
              if (profile && tier !== profile.subscriptionTier) {
                await syncTierToSupabase(tier).catch(() => {});
                setProfile({ ...profile, subscriptionTier: tier });
              }
            }).catch(() => {});
          }).catch(() => setProfile(null));
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        setSession(null); // Force isLoading=false even if getSession() fails
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const profile = await fetchProfile();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setProfile]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
