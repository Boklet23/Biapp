import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/auth';
import { fetchProfile } from '@/services/profile';
import { initPurchases, mapEntitlementToTier, syncTierToSupabase } from '@/services/subscription';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';

const isExpoGo = Constants.appOwnership === 'expo';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  enableLogs: true,
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
            // Init RevenueCat and sync subscription tier (Android only — iOS not configured)
            if (Platform.OS === 'android') {
              initPurchases(session.user.id).then(async (info) => {
                const tier = mapEntitlementToTier(info);
                if (profile && tier !== profile.subscriptionTier) {
                  await syncTierToSupabase(tier).catch((e: Error) => {
                    Sentry.captureException(e, { extra: { context: 'initPurchases syncTier' } });
                  });
                  setProfile({ ...profile, subscriptionTier: tier });
                }
              }).catch((e: Error) => {
                if (!isExpoGo) Sentry.captureException(e);
              });
            }
          }).catch(() => setProfile(null));
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        setSession(null); // Force isLoading=false even if getSession() fails
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION is handled by getSession() above — skip to avoid double profile fetch
      if (event === 'INITIAL_SESSION') return;
      setSession(session);
      if (session) {
        fetchProfile().then(setProfile).catch(() => setProfile(null));
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
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <RootLayoutNav />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
