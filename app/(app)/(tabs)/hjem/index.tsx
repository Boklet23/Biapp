import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { WeatherCard } from '@/components/home/WeatherCard';
import { HiveStatusCard, AddHiveCard } from '@/components/home/HiveStatusCard';
import { HoneyWidget } from '@/components/home/HoneyWidget';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { Colors } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections } from '@/services/inspection';
import { fetchHarvests } from '@/services/harvest';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { Inspection } from '@/types';

function greeting(name: string | null | undefined): string {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(' ')[0]}` : '';
  if (h < 10) return `God morgen${n} 🌅`;
  if (h < 18) return `Hei${n} 🐝`;
  return `God kveld${n} 🌙`;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
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

  const harvestedKgThisYear = Math.round(
    harvests
      .filter((h) => h.harvestedAt.startsWith(String(currentYear)))
      .reduce((sum, h) => sum + h.quantityKg, 0) * 10
  ) / 10;

  const hiveWithCoords = hives.find((h) => h.locationLat && h.locationLng);
  const weatherLat = hiveWithCoords?.locationLat;
  const weatherLng = hiveWithCoords?.locationLng;
  const weatherLocation = hiveWithCoords?.locationName ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{greeting(profile?.displayName)}</Text>
          <Pressable
            onPress={() => router.push('/(app)/profil' as any)}
            style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Åpne profil"
          >
            <Text style={styles.profileBtnText}>⚙️</Text>
          </Pressable>
        </View>

        <SectionTitle>Vær</SectionTitle>
        <WeatherCard lat={weatherLat} lng={weatherLng} locationName={weatherLocation} />

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

        <SectionTitle>Honning</SectionTitle>
        <HoneyWidget
          activeHiveCount={activeHives.length}
          harvestedKgThisYear={harvestedKgThisYear}
        />

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
  profileBtn: { padding: 4 },
  profileBtnText: { fontSize: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 2,
  },
  loadingBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
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
