import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

const REMINDER_IDS_KEY = 'inspection_reminder_ids';

async function getStoredReminderIds(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

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

export async function scheduleInspectionReminderDeduped(
  hiveId: string,
  hiveName: string
): Promise<void> {
  const existing = await getStoredReminderIds();
  if (existing[hiveId]) return;
  const id = await scheduleInspectionReminder(hiveId, hiveName);
  if (id) {
    await AsyncStorage.setItem(
      REMINDER_IDS_KEY,
      JSON.stringify({ ...existing, [hiveId]: id })
    );
  }
}

export async function clearScheduledReminder(hiveId: string): Promise<void> {
  const existing = await getStoredReminderIds();
  if (!existing[hiveId]) return;
  await cancelInspectionReminders([existing[hiveId]]);
  const { [hiveId]: _removed, ...rest } = existing;
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(rest));
}

export async function scheduleInspectionReminder(
  hiveId: string,
  hiveName: string
): Promise<string | null> {
  if (isExpoGo || Platform.OS === 'web') return null;
  await initNotificationHandler();
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const { scheduleNotificationAsync, SchedulableTriggerInputTypes } = await import('expo-notifications');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const id = await scheduleNotificationAsync({
    content: {
      title: '🐝 Inspeksjon forfaller',
      body: `${hiveName} har ikke blitt inspisert på over 2 uker`,
      data: { hiveId, type: 'inspection_reminder' },
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: tomorrow },
  });

  return id;
}

export async function cancelInspectionReminders(notificationIds: string[]): Promise<void> {
  if (isExpoGo || notificationIds.length === 0) return;
  const { cancelScheduledNotificationAsync } = await import('expo-notifications');
  await Promise.all(notificationIds.map((id) => cancelScheduledNotificationAsync(id)));
}

const SEASONAL_IDS_KEY = 'seasonal_reminder_ids';

export async function scheduleSeasonalReminders(): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') return;
  await initNotificationHandler();
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const { SEASON_REMINDERS } = await import('@/constants/seasonReminders');
  const { scheduleNotificationAsync, SchedulableTriggerInputTypes } = await import('expo-notifications');

  const stored: Record<string, string> = {};
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const reminder of SEASON_REMINDERS) {
    const fireDate = new Date(currentYear, reminder.month - 1, reminder.day, 8, 0, 0);
    // If this year's date has passed, schedule for next year
    if (fireDate <= now) fireDate.setFullYear(currentYear + 1);

    try {
      const id = await scheduleNotificationAsync({
        content: { title: reminder.title, body: reminder.body, data: { type: 'season', reminderId: reminder.id } },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: fireDate },
      });
      stored[reminder.id] = id;
    } catch {
      // Skip if scheduling fails for any single reminder
    }
  }

  await AsyncStorage.setItem(SEASONAL_IDS_KEY, JSON.stringify(stored));
}

export async function cancelSeasonalReminders(): Promise<void> {
  if (isExpoGo) return;
  try {
    const raw = await AsyncStorage.getItem(SEASONAL_IDS_KEY);
    if (!raw) return;
    const stored: Record<string, string> = JSON.parse(raw);
    const { cancelScheduledNotificationAsync } = await import('expo-notifications');
    await Promise.all(Object.values(stored).map((id) => cancelScheduledNotificationAsync(id)));
    await AsyncStorage.removeItem(SEASONAL_IDS_KEY);
  } catch {
    // Fail silently
  }
}

export async function getSeasonalRemindersEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SEASONAL_IDS_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw);
    return Object.keys(stored).length > 0;
  } catch {
    return false;
  }
}

const SWARM_CHECKED_KEY = 'bivokter_swarm_checked';
const SWARM_ALERT_RADIUS_KM = 30;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Sjekker om det er nye svermrapporter innen SWARM_ALERT_RADIUS_KM km fra en av brukerens kuber */
export async function checkNearbySwarmAlerts(
  hiveLats: number[],
  hiveLngs: number[]
): Promise<void> {
  if (isExpoGo || hiveLats.length === 0) return;

  try {
    const lastChecked = await AsyncStorage.getItem(SWARM_CHECKED_KEY).catch(() => null);
    const since = lastChecked ?? new Date(Date.now() - 7 * 86400000).toISOString();

    const { data, error } = await supabase
      .from('swarm_reports')
      .select('id, lat, lng, description, created_at')
      .eq('status', 'open')
      .gte('created_at', since);

    if (error || !data) return;

    await AsyncStorage.setItem(SWARM_CHECKED_KEY, new Date().toISOString()).catch(() => null);

    const nearby = (data as { id: string; lat: number; lng: number; description: string }[]).filter((report) =>
      hiveLats.some((lat, i) => haversineKm(lat, hiveLngs[i], report.lat, report.lng) <= SWARM_ALERT_RADIUS_KM)
    );

    if (nearby.length === 0) return;

    const granted = await requestNotificationPermission();
    if (!granted) return;

    const { scheduleNotificationAsync } = await import('expo-notifications');
    await scheduleNotificationAsync({
      content: {
        title: `🐝 ${nearby.length} sverm${nearby.length > 1 ? 'er' : ''} nær deg`,
        body: `Nye svermrapporter innen ${SWARM_ALERT_RADIUS_KM} km. Sjekk Samfunn-fanen.`,
        sound: true,
      },
      trigger: null,
    });
  } catch {
    // Sverm-varsler er nice-to-have
  }
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
