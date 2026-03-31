import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { WeatherCard } from '@/components/home/WeatherCard';
import { HiveStatusCard, AddHiveCard } from '@/components/home/HiveStatusCard';
import { HoneyWidget } from '@/components/home/HoneyWidget';
import { SeasonSummaryCard } from '@/components/home/SeasonSummaryCard';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { Colors, Shadows } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections } from '@/services/inspection';
import { fetchHarvests } from '@/services/harvest';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { scheduleInspectionReminderDeduped } from '@/services/notifications';
import { Hive, Inspection } from '@/types';

const VARROA_ALERT_THRESHOLD = 3;
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
  type: 'varroa' | 'overdue';
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
      const days = daysSince(insp.inspectedAt);
      if (days >= INSPECTION_OVERDUE_DAYS) {
        alerts.push({ hiveId: hive.id, hiveName: hive.name, type: 'overdue', detail: `${days} dager siden siste inspeksjon` });
      }
    }
  }
  return alerts;
}

export default function Hjem() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useToastStore((s) => s.show);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: hives = [], isLoading: hivesLoading } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
    meta: { onError: () => showToast('Kunne ikke laste kuber', 'error') },
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: fetchAllInspections,
  });

  const { data: harvests = [] } = useQuery({
    queryKey: ['harvests'],
    queryFn: fetchHarvests,
  });

  const lastInspectionByHive = allInspections.reduce<Record<string, Inspection>>(
    (acc, insp) => {
      const existing = acc[insp.hiveId];
      if (!existing || insp.inspectedAt > existing.inspectedAt) {
        acc[insp.hiveId] = insp;
      }
      return acc;
    },
    {}
  );

  const activeHives = hives.filter((h) => h.isActive);
  const alerts = buildAlerts(hives, lastInspectionByHive);

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

  const hiveWithCoords = hives.find((h) => h.locationLat && h.locationLng);
  const weatherLat = hiveWithCoords?.locationLat;
  const weatherLng = hiveWithCoords?.locationLng;
  const weatherLocation = hiveWithCoords?.locationName ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hilsen + Avatar */}
        <View style={styles.greetingRow}>
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
                    accessibilityLabel={a.type === 'varroa' ? 'Varroa-advarsel' : 'Inspeksjon forfalt'}
                  >
                    {a.type === 'varroa' ? '🔴' : '⏰'}
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

        {/* Vær */}
        <SectionTitle>Vær</SectionTitle>
        <WeatherCard lat={weatherLat} lng={weatherLng} locationName={weatherLocation} />

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
      </ScrollView>
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
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 2,
  },

  alertsBox: {
    backgroundColor: Colors.warning + '0A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
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

  loadingBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Shadows.card,
  },
  hiveScroll: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  emptyHives: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 15, color: Colors.mid },
  emptyLink: { fontSize: 15, color: Colors.honey, fontWeight: '700', marginTop: 4 },
});
