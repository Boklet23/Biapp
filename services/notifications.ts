import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleEventNotification(
  eventId: string,
  title: string,
  eventDate: string // 'YYYY-MM-DD'
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  // Schedule for 08:00 on the event date
  const [year, month, day] = eventDate.split('-').map(Number);
  const date = new Date(year, month - 1, day, 8, 0, 0);

  if (date <= new Date()) return null; // Already passed

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🐝 Kalenderminne',
      body: title,
      data: { eventId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return;
  if (Platform.OS === 'web') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
  } catch {
    // Push-token er nice-to-have — appen fungerer uten
  }
}
