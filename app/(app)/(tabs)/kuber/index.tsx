import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { HiveCard } from '@/components/hive/HiveCard';
import { BeeParticles } from '@/components/animations/BeeParticles';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors } from '@/constants/colors';
import { fetchHives, deleteHive } from '@/services/hive';
import { fetchInspections, fetchLastInspectionPerHive } from '@/services/inspection';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { Hive, Inspection } from '@/types';

const STARTER_HIVE_LIMIT = 3;

type Filter = 'alle' | 'friske' | 'varsel';

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

export default function KuberOversikt() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [filter, setFilter] = useState<Filter>('alle');
  const showToast = useToastStore((s) => s.show);
  const profile = useAuthStore((s) => s.profile);
  const isStarter = (profile?.subscriptionTier ?? 'starter') === 'starter';

  const { data: hives = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
  });

  const { data: lastInspectionByHive = {} } = useQuery({
    queryKey: ['last-inspection-per-hive'],
    queryFn: fetchLastInspectionPerHive,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hives'] });
    },
    onError: (error: Error) => {
      showToast(error.message ?? 'Kunne ikke slette kuben. Prøv igjen.', 'error');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (hive: Hive) => {
    Alert.alert(
      'Slett kube',
      `Er du sikker på at du vil slette "${hive.name}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Slett', style: 'destructive', onPress: () => deleteMutation.mutate(hive.id) },
      ]
    );
  };

  const activeHives = hives.filter((h) => h.isActive);
  const hivesWithScore = activeHives.map((h) => ({
    hive: h,
    score: computeHealthScore(lastInspectionByHive[h.id]),
  }));
  const freskeCount = hivesWithScore.filter((x) => x.score >= 70).length;
  const varselCount = hivesWithScore.filter((x) => x.score < 70).length;

  const filtered = hivesWithScore
    .filter((x) => {
      if (filter === 'friske') return x.score >= 70;
      if (filter === 'varsel') return x.score < 70;
      return true;
    })
    .map((x) => x.hive);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.honey} />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Kunne ikke laste kuber</Text>
          <Text style={[styles.emptyText, { marginBottom: 24 }]}>Sjekk internettforbindelsen og prøv igjen</Text>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [styles.chip, { backgroundColor: Colors.honey }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.chipText, { color: Colors.dark }]}>Prøv igjen</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.headerWrap}>
        <BeeParticles height={70} />
        <View style={styles.header}>
          <Text style={styles.kicker}>Bigård</Text>
          <Text style={styles.title}>Mine Kuber</Text>
          <Text style={styles.summary}>
            <Text style={styles.summaryStrong}>{activeHives.length}</Text>
            <Text style={styles.summaryMid}> totalt · </Text>
            <Text style={[styles.summaryStrong, { color: Colors.success }]}>{freskeCount}</Text>
            <Text style={styles.summaryMid}> friske · </Text>
            <Text style={[styles.summaryStrong, { color: Colors.error }]}>{varselCount}</Text>
            <Text style={styles.summaryMid}> varsel</Text>
          </Text>
        </View>

        {/* Filter chips */}
        <View style={styles.chips}>
          {([
            { id: 'alle',   label: 'Alle',   count: activeHives.length },
            { id: 'friske', label: 'Friske', count: freskeCount },
            { id: 'varsel', label: 'Varsel', count: varselCount },
          ] as { id: Filter; label: string; count: number }[]).map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={({ pressed }) => [
                styles.chip,
                filter === f.id && styles.chipActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
                {f.label}
              </Text>
              <Text style={[styles.chipCount, filter === f.id && styles.chipCountActive]}>
                {f.count}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.honey} />
        }
        renderItem={({ item }) => (
          <HiveWithInspection
            hive={item}
            onPress={() => router.push({ pathname: '/kuber/[id]' as any, params: { id: item.id } })}
            onLongPress={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐝</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'alle' ? 'Ingen kuber ennå' : 'Ingen kuber i denne kategorien'}
            </Text>
            {filter === 'alle' && (
              <Text style={styles.emptyText}>Trykk + for å legge til din første bikube</Text>
            )}
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          if (isStarter && hives.length >= STARTER_HIVE_LIMIT) {
            setUpgradeModalVisible(true);
          } else {
            router.push('/kuber/ny');
          }
        }}
        accessibilityLabel="Legg til ny kube"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
      />
    </Screen>
  );
}

function HiveWithInspection({
  hive,
  onPress,
  onLongPress,
}: {
  hive: Hive;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', hive.id],
    queryFn: () => fetchInspections(hive.id),
  });

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={600}>
      <HiveCard hive={hive} lastInspection={inspections[0]} onPress={onPress} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: Colors.creamDeep,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: Colors.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    color: Colors.inkSoft,
  },
  summaryStrong: {
    fontWeight: '700',
    color: Colors.ink,
  },
  summaryMid: {
    color: Colors.muted,
  },

  chips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.dark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.inkSoft,
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipCount: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.muted,
  },
  chipCountActive: {
    color: Colors.honey,
  },

  list: { padding: 20, gap: 12, paddingBottom: 100 },
  emptyList: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  emptyText: { fontSize: 14, color: Colors.mid, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.honeyDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  fabText: { fontSize: 28, color: Colors.dark, fontWeight: '400', lineHeight: 32 },
});
