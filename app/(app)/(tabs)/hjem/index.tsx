import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { WeatherCard } from '@/components/home/WeatherCard';
import { HiveStatusCard, AddHiveCard } from '@/components/home/HiveStatusCard';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { Colors } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections } from '@/services/inspection';
import { useAuthStore } from '@/store/auth';
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
  const currentMonth = new Date().getMonth() + 1;

  const { data: hives = [] } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
  });

  const { data: allInspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: fetchAllInspections,
  });

  // Siste inspeksjon per kube
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

  // Vær: bruk koordinater fra første kube med coords, ellers Oslo
  const hiveWithCoords = hives.find((h) => h.locationLat && h.locationLng);
  const weatherLat = hiveWithCoords?.locationLat;
  const weatherLng = hiveWithCoords?.locationLng;
  const weatherLocation = hiveWithCoords?.locationName ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hilsen + Profil-ikon */}
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

        {/* Vær */}
        <SectionTitle>Vær</SectionTitle>
        <WeatherCard lat={weatherLat} lng={weatherLng} locationName={weatherLocation} />

        {/* Kuber */}
        <SectionTitle>Mine kuber</SectionTitle>
        {hives.length === 0 ? (
          <View style={styles.emptyHives}>
            <Text style={styles.emptyEmoji}>🐝</Text>
            <Text style={styles.emptyText}>Du har ingen kuber ennå</Text>
            <Text
              style={styles.emptyLink}
              onPress={() => router.push('/kuber/ny' as any)}
            >
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
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark,
    flex: 1,
  },
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
  hiveScroll: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 4,
  },
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
