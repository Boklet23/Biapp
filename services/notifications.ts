import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// expo-notifications push-støtte er fjernet fra Expo Go i SDK 53.
// Vi bruker dynamisk import for å unngå at side-effecten krasjer route-tree-bygging.
const isExpoGo = Constants.appOwnership === 'expo';

let notificationHandlerInitialized = false;

async function initNotificationHandler() {
  if (notificationHandlerInitialized || isExpoGo) return;
  notificationHandlerInitialized = true;
  const { setNotificationHandler } = await import('expo-notifications');
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web' || isExpoGo) return false;
  await initNotificationHandler();
  const { getPermissionsAsync, requestPermissionsAsync } = await import('expo-notifications');
  const { status: existing } = await getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleEventNotification(
  eventId: string,
  title: string,
  eventDate: string // 'YYYY-MM-DD'
): Promise<string | null> {
  if (isExpoGo) return null;
  await initNotificationHandler();
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const [year, month, day] = eventDate.split('-').map(Number);
  const date = new Date(year, month - 1, day, 8, 0, 0);
  if (date <= new Date()) return null;

  const { scheduleNotificationAsync, SchedulableTriggerInputTypes } = await import('expo-notifications');
  const id = await scheduleNotificationAsync({
    content: {
      title: '🐝 Kalenderminne',
      body: title,
      data: { eventId },
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  if (isExpoGo) return;
  const { cancelScheduledNotificationAsync } = await import('expo-notifications');
  await cancelScheduledNotificationAsync(notificationId);
}

export async function registerPushToken(): Promise<void> {
  if (isExpoGo) return;
  if (Platform.OS === 'web') return;

  const Device = await import('expo-device');
  if (!Device.default.isDevice) return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;

  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const { getExpoPushTokenAsync } = await import('expo-notifications');
    const { data: token } = await getExpoPushTokenAsync({ projectId });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
  } catch {
    // Push-token er nice-to-have — appen fungerer uten
  }
}
