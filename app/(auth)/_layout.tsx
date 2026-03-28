import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (session) {
    return <Redirect href="/(app)/(tabs)/hjem" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
