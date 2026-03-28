import { useLayoutEffect } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { Screen } from '@/components/ui/Screen';
import { HiveTypeChip } from '@/components/hive/HiveTypeChip';
import { Colors } from '@/constants/colors';
import { fetchHive } from '@/services/hive';
import { fetchInspections } from '@/services/inspection';
import { Hive, Inspection } from '@/types';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

function HiveMapSection({ hive }: { hive: Hive }) {
  if (!hive.locationLat || !hive.locationLng) return null;
  return (
    <View style={styles.mapSection}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        attributionPosition={{ bottom: 2, right: 4 }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Camera
          centerCoordinate={[hive.locationLng, hive.locationLat]}
          zoomLevel={13}
          animationDuration={0}
        />
        <PointAnnotation
          id="hive-location"
          coordinate={[hive.locationLng, hive.locationLat]}
        >
          <View style={styles.pin}>
            <Text style={styles.pinEmoji}>🏠</Text>
          </View>
        </PointAnnotation>
      </MapView>
    </View>
  );
}

const MOOD_EMOJI = ['', '😟', '😐', '😊', '😁', '🤩'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'i dag';
  if (days === 1) return 'i går';
  return `${days} dager siden`;
}

function InspectionRow({ item, hiveId }: { item: Inspection; hiveId: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.inspRow, pressed && styles.inspRowPressed]}
      onPress={() => router.push({ pathname: '/kuber/[id]/inspeksjon/[inspId]', params: { id: hiveId, inspId: item.id } })}
    >
      <View style={styles.inspLeft}>
        <Text style={styles.inspDate}>{formatDate(item.inspectedAt)}</Text>
        <Text style={styles.inspSub}>{daysSince(item.inspectedAt)}</Text>
      </View>
      <View style={styles.inspRight}>
        {item.moodScore != null && (
          <Text style={styles.moodEmoji}>{MOOD_EMOJI[item.moodScore]}</Text>
        )}
        {item.varroaCount != null && (
          <Text style={styles.varroaText}>Varroa: {item.varroaCount}</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function KubeProfil() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const { data: hive, isLoading: hiveLoading } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', id],
    queryFn: () => fetchInspections(id),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: hive?.name ?? '',
      headerRight: () => (
        <Pressable
          onPress={() => router.push({ pathname: '/kuber/[id]/rediger', params: { id } })}
          hitSlop={12}
          style={{ marginRight: 4 }}
        >
          <Text style={styles.editBtn}>Rediger</Text>
        </Pressable>
      ),
    });
  }, [navigation, hive, id]);

  if (hiveLoading || !hive) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Laster kube...</Text>
        </View>
      </Screen>
    );
  }

  const lastInspection = inspections[0];

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hive info header */}
        <View style={styles.hiveHeader}>
          <HiveTypeChip type={hive.type} />
          {hive.locationName && (
            <Text style={styles.location}>📍 {hive.locationName}</Text>
          )}
        </View>

        {/* Map */}
        <HiveMapSection hive={hive} />

        {/* Last inspection summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Siste inspeksjon</Text>
          {lastInspection ? (
            <Pressable
              style={({ pressed }) => [styles.lastInspCard, pressed && styles.inspRowPressed]}
              onPress={() => router.push({ pathname: '/kuber/[id]/inspeksjon/[inspId]', params: { id, inspId: lastInspection.id } })}
            >
              <Text style={styles.lastInspDate}>{formatDate(lastInspection.inspectedAt)}</Text>
              <View style={styles.lastInspRow}>
                {lastInspection.numFramesBrood != null && (
                  <View style={styles.statChip}>
                    <Text style={styles.statValue}>{lastInspection.numFramesBrood}</Text>
                    <Text style={styles.statLabel}>yngel</Text>
                  </View>
                )}
                {lastInspection.numFramesHoney != null && (
                  <View style={styles.statChip}>
                    <Text style={styles.statValue}>{lastInspection.numFramesHoney}</Text>
                    <Text style={styles.statLabel}>honning</Text>
                  </View>
                )}
                {lastInspection.numFramesEmpty != null && (
                  <View style={styles.statChip}>
                    <Text style={styles.statValue}>{lastInspection.numFramesEmpty}</Text>
                    <Text style={styles.statLabel}>tomme</Text>
                  </View>
                )}
                {lastInspection.moodScore != null && (
                  <View style={styles.statChip}>
                    <Text style={styles.statValue}>{MOOD_EMOJI[lastInspection.moodScore]}</Text>
                    <Text style={styles.statLabel}>humør</Text>
                  </View>
                )}
              </View>
              {lastInspection.queenSeen && (
                <Text style={styles.queenBadge}>✓ Dronning sett</Text>
              )}
            </Pressable>
          ) : (
            <Text style={styles.emptyText}>Ingen inspeksjoner ennå</Text>
          )}
        </View>

        {/* Inspection history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historikk ({inspections.length})</Text>
          {inspections.length === 0 ? (
            <Text style={styles.emptyText}>Start med å legge til en inspeksjon</Text>
          ) : (
            inspections.map((insp) => (
              <InspectionRow key={insp.id} item={insp} hiveId={id} />
            ))
          )}
        </View>

        {hive.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notater</Text>
            <Text style={styles.notesText}>{hive.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* New inspection FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push({ pathname: '/kuber/[id]/inspeksjon/ny', params: { id } })}
        accessibilityLabel="Ny inspeksjon"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+ Inspeksjon</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 20, gap: 0, paddingBottom: 100 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, color: Colors.mid },
  editBtn: { fontSize: 16, color: Colors.honey, fontWeight: '600' },

  hiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  location: { fontSize: 14, color: Colors.mid },

  mapSection: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  map: { flex: 1 },
  pin: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: { fontSize: 16 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  lastInspCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lastInspDate: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 10 },
  lastInspRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  statChip: { alignItems: 'center', minWidth: 48 },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  statLabel: { fontSize: 11, color: Colors.mid, marginTop: 2 },
  queenBadge: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
  },

  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  inspRowPressed: { opacity: 0.6 },
  inspLeft: { gap: 2 },
  inspDate: { fontSize: 15, color: Colors.dark, fontWeight: '500' },
  inspSub: { fontSize: 12, color: Colors.mid },
  inspRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodEmoji: { fontSize: 18 },
  varroaText: { fontSize: 13, color: Colors.mid },
  chevron: { fontSize: 20, color: Colors.mid, fontWeight: '300' },

  emptyText: { fontSize: 14, color: Colors.mid },
  notesText: { fontSize: 14, color: Colors.dark, lineHeight: 21 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.honey,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
  fabText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
