import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { LocationPickerModal, PickedLocation } from '@/components/home/LocationPickerModal';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { Colors } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections, fetchLastInspectionPerHive } from '@/services/inspection';
import { fetchHarvests } from '@/services/harvest';
import { fetchAllTreatments } from '@/services/treatment';
import { fetchForecast, fetchWeather, ForecastDay } from '@/services/weather';
import { generateAndShareReport } from '@/services/report';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { scheduleInspectionReminderDeduped, checkNearbySwarmAlerts } from '@/services/notifications';
import { Hive, Inspection } from '@/types';

const VARROA_ALERT_THRESHOLD = 3;
const INSPECTION_OVERDUE_DAYS = 14;

function greeting(name: string | null | undefined): string {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(' ')[0]}` : '';
  if (h < 10) return `God morgen${n}`;
  if (h < 18) return `Hei${n}`;
  return `God kveld${n}`;
}

function formatDate(): string {
  const d = new Date();
  const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  return `${days[d.getDay()]} ${d.getDate()}. ${months[d.getMonth()]}`;
}

function initials(profile: { displayName: string | null; email: string } | null): string {
  if (!profile) return '?';
  const name = profile.displayName ?? profile.email;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function computeHealthScore(insp: Inspection | undefined): number {
  if (!insp) return 50;
  const varroa = insp.varroaCount ?? 0;
  if (varroa === 0) return 95;
  if (varroa <= 1) return 88;
  if (varroa <= 2) return 78;
  if (varroa <= 3) return 65;
  if (varroa <= 5) return 48;
  return 32;
}

interface Alert {
  hiveId: string;
  hiveName: string;
  type: 'varroa' | 'overdue' | 'swarm';
}

function buildAlerts(hives: Hive[], lastInspectionByHive: Record<string, Inspection>): Alert[] {
  const alerts: Alert[] = [];
  for (const hive of hives) {
    if (!hive.isActive) continue;
    const insp = lastInspectionByHive[hive.id];
    if (!insp) {
      alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'overdue' });
    } else {
      if (insp.varroaCount != null && insp.varroaCount >= VARROA_ALERT_THRESHOLD) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'varroa' });
      }
      if (insp.queenCellsFound) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'swarm' });
      }
      if (daysSince(insp.inspectedAt) >= INSPECTION_OVERDUE_DAYS) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'overdue' });
      }
    }
  }
  return alerts;
}

const WEATHER_LOCATION_KEY = 'bivokter_weather_location';

const SHORT_DAY: Record<string, string> = {
  Sunday: 'Søn', Monday: 'Man', Tuesday: 'Tir',
  Wednesday: 'Ons', Thursday: 'Tor', Friday: 'Fre', Saturday: 'Lør',
};
function shortDay(dateStr: string): string {
  const d = new Date(dateStr);
  const en = d.toLocaleDateString('en-US', { weekday: 'long' });
  return SHORT_DAY[en] ?? en.slice(0, 3);
}

function weatherEmoji(symbol: string): string {
  if (symbol.includes('clearsky') || symbol.includes('fair')) return '☀️';
  if (symbol.includes('rain') || symbol.includes('shower')) return '🌧';
  if (symbol.includes('snow')) return '❄️';
  if (symbol.includes('thunder')) return '⛈';
  return '⛅️';
}

export default function Hjem() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useToastStore((s) => s.show);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [savedLocation, setSavedLocation] = useState<PickedLocation | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WEATHER_LOCATION_KEY).then((raw) => {
      if (raw) {
        try { setSavedLocation(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const { data: hives = [], isLoading: hivesLoading } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
    meta: { onError: () => showToast('Kunne ikke laste kuber', 'error') },
  });

  const { data: lastInspectionByHive = {} } = useQuery({
    queryKey: ['last-inspection-per-hive'],
    queryFn: fetchLastInspectionPerHive,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: fetchAllInspections,
    staleTime: 5 * 60 * 1000,
  });

  const { data: harvests = [] } = useQuery({
    queryKey: ['harvests'],
    queryFn: fetchHarvests,
    staleTime: 5 * 60 * 1000,
  });

  const hiveWithCoords = hives.find((h) => h.locationLat && h.locationLng);
  const weatherLat = savedLocation?.lat ?? hiveWithCoords?.locationLat;
  const weatherLng = savedLocation?.lng ?? hiveWithCoords?.locationLng;
  const weatherLocation = savedLocation?.name ?? hiveWithCoords?.locationName ?? null;

  const { data: forecast = [] } = useQuery({
    queryKey: ['forecast', weatherLat?.toFixed(2), weatherLng?.toFixed(2)],
    queryFn: () => fetchForecast(weatherLat!, weatherLng!),
    enabled: !!weatherLat && !!weatherLng,
    staleTime: 60 * 60 * 1000,
  });

  const { data: currentWeather } = useQuery({
    queryKey: ['weather-current', weatherLat?.toFixed(2), weatherLng?.toFixed(2)],
    queryFn: () => fetchWeather(weatherLat!, weatherLng!),
    enabled: !!weatherLat && !!weatherLng,
    staleTime: 60 * 60 * 1000,
  });

  const activeHives = hives.filter((h) => h.isActive);
  const alerts = buildAlerts(hives, lastInspectionByHive);

  const urgentInspHives = useMemo(() =>
    [...activeHives].sort((a, b) => {
      const dA = lastInspectionByHive[a.id]?.inspectedAt ?? '';
      const dB = lastInspectionByHive[b.id]?.inspectedAt ?? '';
      return dA < dB ? -1 : dA > dB ? 1 : 0;
    }).slice(0, 3),
    [activeHives, lastInspectionByHive],
  );

  const harvestedKgThisYear = Math.round(
    harvests
      .filter((h) => h.harvestedAt.startsWith(String(currentYear)))
      .reduce((sum, h) => sum + h.quantityKg, 0) * 10
  ) / 10;

  const avgHealth = useMemo(() => {
    if (activeHives.length === 0) return 0;
    const total = activeHives.reduce((sum, h) => sum + computeHealthScore(lastInspectionByHive[h.id]), 0);
    return Math.round(total / activeHives.length);
  }, [activeHives, lastInspectionByHive]);

  useEffect(() => {
    const overdueHives = alerts.filter((a) => a.type === 'overdue');
    if (overdueHives.length === 0) return;
    overdueHives.forEach(({ hiveId, hiveName }) => {
      scheduleInspectionReminderDeduped(hiveId, hiveName).catch(() => {});
    });
  }, [alerts.length]);

  useEffect(() => {
    const lats = hives.filter((h) => h.locationLat && h.locationLng).map((h) => h.locationLat!);
    const lngs = hives.filter((h) => h.locationLat && h.locationLng).map((h) => h.locationLng!);
    if (lats.length > 0) checkNearbySwarmAlerts(lats, lngs).catch(() => {});
  }, [hives.length]);

  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const [reportInspections, treatments] = await Promise.all([
        allInspections.length > 0 ? Promise.resolve(allInspections) : fetchAllInspections(),
        fetchAllTreatments(),
      ]);
      await generateAndShareReport({
        year: currentYear,
        hives,
        inspections: reportInspections,
        harvests,
        treatments,
        weights: [],
        displayName: profile?.displayName ?? null,
      });
    } catch {
      showToast('Kunne ikke generere rapport', 'error');
    } finally {
      setReportLoading(false);
    }
  }, [currentYear, hives, allInspections, harvests, profile, showToast]);

  const handleLocationPick = async (loc: PickedLocation) => {
    setSavedLocation(loc);
    setLocationPickerVisible(false);
    await AsyncStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify(loc)).catch(() => {});
  };

  const todayForecast = forecast[0];
  const restForecast = forecast.slice(1, 6);
  const flyDay = todayForecast?.goodForInspection;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ─── Hero (navy) ─── */}
        <View style={styles.hero}>
          {/* Greeting row */}
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.heroDate}>{formatDate()}</Text>
              <Text style={styles.heroGreeting}>{greeting(profile?.displayName)}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/profil' as any)}
              style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Åpne profil"
            >
              <Text style={styles.avatarText}>{initials(profile)}</Text>
            </Pressable>
          </View>

          {/* Weather + fly-day */}
          {weatherLat && weatherLng ? (
            <Pressable
              style={styles.weatherRow}
              onPress={() => setLocationPickerVisible(true)}
              accessibilityRole="button"
            >
              <View style={styles.weatherMain}>
                <View style={styles.weatherIcon}>
                  <Text style={styles.weatherEmoji}>
                    {currentWeather ? weatherEmoji(currentWeather.condition) : '⛅️'}
                  </Text>
                </View>
                <View style={styles.weatherInfo}>
                  <View style={styles.weatherTempRow}>
                    <Text style={styles.weatherTemp}>
                      {currentWeather ? `${currentWeather.temp}°` : todayForecast ? `${todayForecast.maxTemp}°` : '–°'}
                    </Text>
                    {weatherLocation && <Text style={styles.weatherCity}>{weatherLocation}</Text>}
                  </View>
                  <Text style={styles.weatherCond}>
                    {currentWeather?.condition ?? todayForecast?.condition ?? 'Laster vær...'}
                  </Text>
                </View>
              </View>
              <View style={[styles.flyDayBtn, flyDay === false && styles.flyDayBtnOff]}>
                <Text style={styles.flyDayEmoji}>🐝</Text>
                <Text style={styles.flyDayLabel}>FLY-DAG</Text>
                <Text style={styles.flyDayStatus}>{flyDay ? 'Gode' : flyDay === false ? 'Dårlig' : '–'}</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={styles.weatherSetup}
              onPress={() => setLocationPickerVisible(true)}
            >
              <Text style={styles.weatherSetupText}>Trykk for å sette opp vær og inspeksjonsplanlegger</Text>
            </Pressable>
          )}

          {/* 5-day forecast */}
          {restForecast.length > 0 && (
            <View style={styles.forecast}>
              {restForecast.map((d: ForecastDay, i: number) => (
                <View
                  key={d.date}
                  style={[styles.forecastDay, i < restForecast.length - 1 && styles.forecastDayBorder]}
                >
                  <Text style={styles.forecastDayName}>{shortDay(d.date)}</Text>
                  <Text style={styles.forecastEmoji}>{weatherEmoji(d.symbol)}</Text>
                  <Text style={styles.forecastTemp}>{d.maxTemp}°</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ─── Stats strip ─── */}
        <View style={styles.stats}>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={styles.statKey}>KUBER</Text>
            <Text style={styles.statVal}>{activeHives.length}</Text>
            <Text style={styles.statSub}>aktive</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={styles.statKey}>SNITT</Text>
            <Text style={[styles.statVal, { color: avgHealth >= 80 ? Colors.success : Colors.honey }]}>
              {hivesLoading ? '–' : avgHealth}
            </Text>
            <Text style={styles.statSub}>helse</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statKey}>KG</Text>
            <Text style={styles.statVal}>{harvestedKgThisYear || '–'}</Text>
            <Text style={styles.statSub}>sesong</Text>
          </View>
        </View>

        {/* ─── Urgent alerts ─── */}
        {alerts.length > 0 && (
          <Pressable
            style={styles.alertBanner}
            onPress={() => router.push('/(app)/(tabs)/kuber' as any)}
            accessibilityRole="button"
          >
            <View style={styles.alertIcon}>
              <Text style={styles.alertExclamation}>!</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>
                {alerts.length} kube{alerts.length > 1 ? 'r' : ''} krever oppmerksomhet
              </Text>
              <Text style={styles.alertNames} numberOfLines={1}>
                {[...new Set(alerts.map((a) => a.hiveName))].join(', ')}
              </Text>
            </View>
            <Text style={styles.alertChevron}>›</Text>
          </Pressable>
        )}

        {/* ─── Inspections / tasks ─── */}
        {urgentInspHives.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionKicker}>Denne uken</Text>
              <Text style={styles.sectionTitle}>Inspeksjoner</Text>
            </View>
            <View style={styles.taskList}>
              {urgentInspHives.map((hive, idx) => {
                const insp = lastInspectionByHive[hive.id];
                const days = insp ? daysSince(insp.inspectedAt) : null;
                const label = days === null
                  ? 'Ikke inspisert ennå'
                  : days === 0 ? 'I dag'
                  : days === 1 ? 'I går'
                  : `${days} dager siden`;
                const urgent = days === null || days >= INSPECTION_OVERDUE_DAYS;
                return (
                  <Pressable
                    key={hive.id}
                    style={({ pressed }) => [
                      styles.taskRow,
                      idx < urgentInspHives.length - 1 && styles.taskRowBorder,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => router.push({ pathname: '/kuber/[id]', params: { id: hive.id } } as any)}
                    accessibilityRole="button"
                  >
                    <View style={[styles.taskHex, urgent && styles.taskHexUrgent]}>
                      <Text style={styles.taskHexIcon}>{urgent ? '⏰' : '✅'}</Text>
                    </View>
                    <View style={styles.taskText}>
                      <Text style={styles.taskName} numberOfLines={1}>{hive.name}</Text>
                      <Text style={[styles.taskSub, urgent && styles.taskSubUrgent]}>{label}</Text>
                    </View>
                    {urgent && (
                      <View style={styles.urgentChip}>
                        <Text style={styles.urgentChipText}>Haster</Text>
                      </View>
                    )}
                    <Text style={styles.taskChevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Sesongguide ─── */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>Dette måneden</Text>
            <Text style={styles.sectionTitle}>Sesongguide</Text>
          </View>
          <SeasonGuide month={currentMonth} />
        </View>

        {/* ─── Rapport-CTA ─── */}
        <Pressable
          style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.88 }]}
          onPress={handleGenerateReport}
          disabled={reportLoading}
        >
          <View style={styles.reportContent}>
            <Text style={styles.reportKicker}>Sesong {currentYear} — klar</Text>
            <Text style={styles.reportTitle}>Generer årsrapport</Text>
            <Text style={styles.reportSub}>
              {activeHives.length} kuber · {harvestedKgThisYear || 0} kg honning
            </Text>
            <View style={styles.reportBtn}>
              {reportLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.reportBtnText}>Lag PDF-rapport  →</Text>
              )}
            </View>
          </View>
        </Pressable>

      </ScrollView>

      <LocationPickerModal
        visible={locationPickerVisible}
        onClose={() => setLocationPickerVisible(false)}
        onPick={handleLocationPick}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },

  // ── Hero ──
  hero: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroDate: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  // Weather
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  weatherMain: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherEmoji: { fontSize: 26 },
  weatherInfo: { flex: 1 },
  weatherTempRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  weatherTemp: {
    fontSize: 30,
    fontWeight: '500',
    color: Colors.white,
    lineHeight: 32,
  },
  weatherCity: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  weatherCond: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  flyDayBtn: {
    width: 80,
    backgroundColor: Colors.honey,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  flyDayBtnOff: { backgroundColor: 'rgba(255,255,255,0.10)' },
  flyDayEmoji: { fontSize: 22 },
  flyDayLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.dark,
  },
  flyDayStatus: { fontSize: 9, fontWeight: '600', color: Colors.dark, opacity: 0.7 },
  weatherSetup: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  weatherSetupText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center' },

  // 5-day forecast
  forecast: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
  },
  forecastDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  forecastDayBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  forecastDayName: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
  forecastEmoji: { fontSize: 18 },
  forecastTemp: { fontSize: 13, fontWeight: '600', color: Colors.white },

  // ── Stats strip ──
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.hair,
  },
  statCardBorder: {},
  statKey: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: 30,
    marginTop: 2,
  },
  statSub: { fontSize: 11, color: Colors.muted, marginTop: 1 },

  // ── Alerts ──
  alertBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.errorSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.18)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertExclamation: { fontSize: 18, fontWeight: '800', color: Colors.white },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '700', color: Colors.error },
  alertNames: { fontSize: 12, color: Colors.inkSoft, marginTop: 1 },
  alertChevron: { fontSize: 20, color: Colors.error, fontWeight: '300' },

  // ── Section header ──
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.ink,
    letterSpacing: -0.3,
  },

  // ── Tasks ──
  taskList: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hair,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hair,
  },
  taskHex: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.honeyWash,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskHexUrgent: { backgroundColor: Colors.errorSoft },
  taskHexIcon: { fontSize: 20 },
  taskText: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '600', color: Colors.ink, letterSpacing: -0.1 },
  taskSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  taskSubUrgent: { color: Colors.warning },
  urgentChip: {
    backgroundColor: Colors.error,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urgentChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  taskChevron: { fontSize: 20, color: Colors.muted, fontWeight: '300' },

  // ── Report CTA ──
  reportCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: Colors.honey,
    overflow: 'hidden',
    shadowColor: Colors.honeyDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  reportContent: {
    padding: 18,
  },
  reportKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(26,26,46,0.6)',
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.dark,
    marginTop: 6,
    letterSpacing: -0.3,
  },
  reportSub: {
    fontSize: 13,
    color: 'rgba(26,26,46,0.75)',
    marginTop: 6,
  },
  reportBtn: {
    marginTop: 14,
    backgroundColor: Colors.dark,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 11,
    alignSelf: 'flex-start',
  },
  reportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
