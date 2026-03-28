import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { GlobalToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/colors';
import { requestNotificationPermission } from '@/services/notifications';

export default function AppLayout() {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (session) {
      requestNotificationPermission();
    }
  }, [session]);

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
