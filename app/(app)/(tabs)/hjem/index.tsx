import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { WeatherCard } from '@/components/home/WeatherCard';
import { LocationPickerModal, PickedLocation } from '@/components/home/LocationPickerModal';
import { HiveScene } from '@/components/animations/HiveScene';
import { HiveStatusCard, AddHiveCard } from '@/components/home/HiveStatusCard';
import { HoneyWidget } from '@/components/home/HoneyWidget';
import { SeasonSummaryCard } from '@/components/home/SeasonSummaryCard';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { Colors, Shadows } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections, fetchLastInspectionPerHive } from '@/services/inspection';
import { fetchHarvests } from '@/services/harvest';
import { fetchAllTreatments } from '@/services/treatment';
import { fetchForecast } from '@/services/weather';
import { generateAndShareReport } from '@/services/report';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { scheduleInspectionReminderDeduped, checkNearbySwarmAlerts } from '@/services/notifications';
import { Hive, Inspection } from '@/types';

const VARROA_ALERT_THRESHOLD = 3;

function timeOfDayGlow(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return '#FFF3CD30'; // morgen — varm gul
  if (h >= 10 && h < 17) return '#FFF8E130'; // dag — lys amber
  if (h >= 17 && h < 21) return '#FFE08230'; // kveld — dyp honning
  return '#1A1A2E18';                         // natt — mørk blå
}
const INSPECTION_OVERDUE_DAYS = 14;

function greeting(name: string | null | undefined): string {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(' ')[0]}` : '';
  if (h < 10) return `God morgen${n} 🌅`;
  if (h < 18) return `Hei${n} 🐝`;
  return `God kveld${n} 🌙`;
}

function initials(profile: { displayName: string | null; email: string } | null): string {
  if (!profile) return '?';
  const name = profile.displayName ?? profile.email;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

interface Alert {
  hiveId: string;
  hiveName: string;
  type: 'varroa' | 'overdue' | 'swarm';
  detail: string;
}

function buildAlerts(
  hives: Hive[],
  lastInspectionByHive: Record<string, Inspection>
): Alert[] {
  const alerts: Alert[] = [];
  for (const hive of hives) {
    if (!hive.isActive) continue;
    const insp = lastInspectionByHive[hive.id];
    if (!insp) {
      alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'overdue', detail: 'Aldri inspisert' });
    } else {
      if (insp.varroaCount != null && insp.varroaCount >= VARROA_ALERT_THRESHOLD) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'varroa', detail: `${insp.varroaCount} varroa ved siste telling` });
      }
      if (insp.queenCellsFound) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'swarm', detail: 'Dronningceller funnet — svermrisiko' });
      }
      const days = daysSince(insp.inspectedAt);
      if (days >= INSPECTION_OVERDUE_DAYS) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'overdue', detail: `${days} dager siden siste inspeksjon` });
      }
    }
  }
  return alerts;
}

const INSPECTION_DAY_NAMES: Record<string, string> = {
  Monday: 'Man', Tuesday: 'Tir', Wednesday: 'Ons',
  Thursday: 'Tor', Friday: 'Fre', Saturday: 'Lør', Sunday: 'Søn',
};

function shortDay(iso: string): string {
  const d = new Date(iso);
  const en = d.toLocaleDateString('en-US', { weekday: 'long' });
  return INSPECTION_DAY_NAMES[en] ?? en.slice(0, 3);
}

function InspectionPlannerWidget({ lat, lng }: { lat: number; lng: number }) {
  const { data: forecast = [] } = useQuery({
    queryKey: ['forecast', lat.toFixed(2), lng.toFixed(2)],
    queryFn: () => fetchForecast(lat, lng),
    staleTime: 60 * 60 * 1000,
  });

  if (forecast.length === 0) return null;

  const best = forecast.find((d) => d.goodForInspection);

  return (
    <View style={plannerStyles.card}>
      <View style={plannerStyles.titleRow}>
        <Text style={plannerStyles.title}>BESTE INSPEKSJONSDAG</Text>
        {best ? (
          <View style={plannerStyles.bestBadge}>
            <Text style={plannerStyles.bestText}>
              {shortDay(best.date)} {best.maxTemp}°C
            </Text>
          </View>
        ) : (
          <Text style={plannerStyles.noGood}>Ingen gode dager neste uke</Text>
        )}
      </View>
      <View style={plannerStyles.row}>
        {forecast.slice(0, 7).map((d) => (
          <View key={d.date} style={[plannerStyles.dayCol, d.goodForInspection && plannerStyles.dayColGood]}>
            <Text style={plannerStyles.dayName}>{shortDay(d.date)}</Text>
            <Text style={plannerStyles.dayTemp}>{d.maxTemp}°</Text>
            <Text style={plannerStyles.dayDot}>{d.goodForInspection ? '✅' : '❌'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const plannerStyles = StyleSheet.create({
  card: {
    backgroundColor: '#EBF5FB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3498DB22',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 11, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6 },
  bestBadge: { backgroundColor: Colors.success, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  bestText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  noGood: { fontSize: 12, color: Colors.mid },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1, paddingVertical: 4, borderRadius: 8 },
  dayColGood: { backgroundColor: Colors.success + '18' },
  dayName: { fontSize: 10, color: Colors.mid, fontWeight: '600' },
  dayTemp: { fontSize: 13, fontWeight: '700', color: Colors.dark },
  dayDot: { fontSize: 12 },
});

const WEATHER_LOCATION_KEY = 'bivokter_weather_location';

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

  // Fast query: only latest inspection per hive (for alerts and UI widgets)
  const { data: lastInspectionByHive = {} } = useQuery({
    queryKey: ['last-inspection-per-hive'],
    queryFn: fetchLastInspectionPerHive,
    staleTime: 5 * 60 * 1000,
  });

  // Full inspection history: for SeasonSummaryCard stats (loads in background, not blocking)
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

  const hiveWithCoords = hives.find((h) => h.locationLat && h.locationLng);
  const weatherLat = savedLocation?.lat ?? hiveWithCoords?.locationLat;
  const weatherLng = savedLocation?.lng ?? hiveWithCoords?.locationLng;
  const weatherLocation = savedLocation?.name ?? hiveWithCoords?.locationName ?? null;

  const handleLocationPick = async (loc: PickedLocation) => {
    setSavedLocation(loc);
    setLocationPickerVisible(false);
    await AsyncStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify(loc)).catch(() => {});
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hilsen + Avatar */}
        <View style={[styles.greetingRow, { backgroundColor: timeOfDayGlow() }]}>
          <Text style={styles.greeting}>{greeting(profile?.displayName)}</Text>
          <Pressable
            onPress={() => router.push('/(app)/profil' as any)}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Åpne profil"
          >
            <Text style={styles.avatarText}>{initials(profile)}</Text>
          </Pressable>
        </View>

        {/* Varsler */}
        {alerts.length > 0 && (
          <>
            <SectionTitle>Varsler</SectionTitle>
            <View style={styles.alertsBox}>
              {alerts.map((a, i) => (
                <Pressable
                  key={`${a.hiveId}-${a.type}`}
                  style={({ pressed }) => [
                    styles.alertRow,
                    i < alerts.length - 1 && styles.alertRowBorder,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => router.push({ pathname: '/kuber/[id]', params: { id: a.hiveId } } as any)}
                >
                  <Text
                    style={styles.alertIcon}
                    accessibilityLabel={a.type === 'varroa' ? 'Varroa-advarsel' : a.type === 'swarm' ? 'Svermrisiko' : 'Inspeksjon forfalt'}
                  >
                    {a.type === 'varroa' ? '🔴' : a.type === 'swarm' ? '🐝' : '⏰'}
                  </Text>
                  <View style={styles.alertTextBox}>
                    <Text style={styles.alertHive}>{a.hiveName}</Text>
                    <Text style={styles.alertDetail}>{a.detail}</Text>
                  </View>
                  <Text style={styles.alertChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Neste inspeksjon */}
        {urgentInspHives.length > 0 && (
          <>
            <SectionTitle>Inspeksjon</SectionTitle>
            <View style={styles.nextInspBox}>
              {urgentInspHives.map((hive, idx) => {
                const insp = lastInspectionByHive[hive.id];
                const days = insp ? daysSince(insp.inspectedAt) : null;
                const label = days === null
                  ? 'Ikke inspisert ennå'
                  : days === 0 ? 'Inspisert i dag'
                  : days === 1 ? 'Inspisert i går'
                  : `${days} dager siden`;
                const urgent = days === null || days >= INSPECTION_OVERDUE_DAYS;
                return (
                  <Pressable
                    key={hive.id}
                    style={({ pressed }) => [
                      styles.nextInspRow,
                      idx < urgentInspHives.length - 1 && styles.nextInspRowBorder,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => router.push({ pathname: '/kuber/[id]', params: { id: hive.id } } as any)}
                  >
                    <Text style={styles.nextInspDot}>{urgent ? '⏰' : '✅'}</Text>
                    <View style={styles.nextInspText}>
                      <Text style={styles.nextInspName} numberOfLines={1}>{hive.name}</Text>
                      <Text style={[styles.nextInspSub, urgent && styles.nextInspUrgent]}>{label}</Text>
                    </View>
                    <Text style={styles.nextInspChevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* 3D Bikube-scene */}
        <HiveScene scene="exterior" height={200} borderRadius={16} />

        {/* Inspeksjonsplanlegger */}
        {weatherLat && weatherLng && (
          <>
            <SectionTitle>Inspeksjonsplanlegger</SectionTitle>
            <InspectionPlannerWidget lat={weatherLat} lng={weatherLng} />
          </>
        )}

        {/* Vær */}
        <SectionTitle>Vær</SectionTitle>
        <WeatherCard
          lat={weatherLat}
          lng={weatherLng}
          locationName={weatherLocation}
          onPress={() => setLocationPickerVisible(true)}
        />

        {/* Kuber */}
        <SectionTitle>Mine kuber</SectionTitle>
        {hivesLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.honey} />
          </View>
        ) : hives.length === 0 ? (
          <View style={styles.emptyHives}>
            <Text style={styles.emptyEmoji}>🐝</Text>
            <Text style={styles.emptyText}>Du har ingen kuber ennå</Text>
            <Text style={styles.emptyLink} onPress={() => router.push('/kuber/ny' as any)}>
              Legg til din første kube →
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hiveScroll}
          >
            {hives.map((hive) => (
              <HiveStatusCard
                key={hive.id}
                hive={hive}
                lastInspection={lastInspectionByHive[hive.id]}
                onPress={() =>
                  router.push({ pathname: '/kuber/[id]', params: { id: hive.id } } as any)
                }
              />
            ))}
            <AddHiveCard onPress={() => router.push('/kuber/ny' as any)} />
          </ScrollView>
        )}

        {/* Honning */}
        <SectionTitle>Honning</SectionTitle>
        <HoneyWidget
          activeHiveCount={activeHives.length}
          harvestedKgThisYear={harvestedKgThisYear}
        />

        {/* Sesong-statistikk */}
        <SeasonSummaryCard
          inspections={allInspections}
          activeHiveCount={activeHives.length}
          lastInspectionByHive={lastInspectionByHive}
        />

        {/* Sesongguide */}
        <SectionTitle>Dette måneden</SectionTitle>
        <SeasonGuide month={currentMonth} />

        {/* Årsrapport */}
        <SectionTitle>Dokumentasjon</SectionTitle>
        <Pressable
          style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.8 }]}
          onPress={handleGenerateReport}
          disabled={reportLoading}
        >
          <Text style={styles.reportBtnIcon}>📄</Text>
          <View style={styles.reportBtnText}>
            <Text style={styles.reportBtnTitle}>{reportLoading ? 'Genererer...' : `Årsrapport ${currentYear}`}</Text>
            <Text style={styles.reportBtnSub}>Inspeksjoner, behandlinger og høsting som PDF</Text>
          </View>
          <Text style={styles.reportBtnArrow}>›</Text>
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
  content: { padding: 20, paddingTop: 12, gap: 10, paddingBottom: 32 },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: Colors.dark, flex: 1 },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: Colors.white },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },

  alertsBox: {
    backgroundColor: Colors.warning + '0A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.warning + '50',
    borderLeftWidth: 5,
    borderLeftColor: Colors.warning,
    ...Shadows.card,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  alertRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '12',
  },
  alertIcon: { fontSize: 18 },
  alertTextBox: { flex: 1 },
  alertHive: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  alertDetail: { fontSize: 12, color: Colors.mid, marginTop: 1 },
  alertChevron: { fontSize: 20, color: Colors.mid, fontWeight: '300' },

  nextInspBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.card,
  },
  nextInspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  nextInspRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.mid + '25',
  },
  nextInspDot: { fontSize: 18 },
  nextInspText: { flex: 1 },
  nextInspName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  nextInspSub: { fontSize: 12, color: Colors.mid, marginTop: 1 },
  nextInspUrgent: { color: Colors.warning },
  nextInspChevron: { fontSize: 20, color: Colors.mid, fontWeight: '300' },

  loadingBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Shadows.card,
  },
  hiveScroll: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  emptyHives: {
    backgroundColor: Colors.light,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.mid + '15',
    ...Shadows.card,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 15, color: Colors.mid },
  emptyLink: { fontSize: 15, color: Colors.honey, fontWeight: '700', marginTop: 4 },

  reportBtn: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  reportBtnIcon: { fontSize: 28 },
  reportBtnText: { flex: 1 },
  reportBtnTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  reportBtnSub: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  reportBtnArrow: { fontSize: 22, color: Colors.mid, fontWeight: '300' },
});
