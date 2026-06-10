import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { HiveCard } from '@/components/hive/HiveCard';
import { HivesMapView } from '@/components/hive/HivesMapView';
import { BeeParticles } from '@/components/animations/BeeParticles';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors, Shadows } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { fetchHives, deleteHive } from '@/services/hive';
import { fetchLastInspectionPerHive } from '@/services/inspection';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useEffectiveTier, tierAtLeast } from '@/hooks/useEffectiveTier';
import { Hive } from '@/types';
import { computeHealthScore } from '@/utils/health';


const STARTER_HIVE_LIMIT = 3;

type Filter = 'alle' | 'friske' | 'varsel';

export default function KuberOversikt() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [upgradeCopy, setUpgradeCopy] = useState<{ title?: string; subtitle?: string }>({});
  const [filter, setFilter] = useState<Filter>('alle');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const showToast = useToastStore((s) => s.show);
  const profile = useAuthStore((s) => s.profile);
  const isStarter = (profile?.subscriptionTier ?? 'starter') === 'starter';
  const effectiveTier = useEffectiveTier();
  const hasPro = tierAtLeast(effectiveTier, 'profesjonell');

  const openProUpgrade = () => {
    setUpgradeCopy({
      title: 'Oppgrader til Profesjonell',
      subtitle: 'Sammenligning av kuber og sesonger er en Profesjonell-funksjon.',
    });
    setUpgradeModalVisible(true);
  };

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
      queryClient.invalidateQueries({ queryKey: ['last-inspection-per-hive'] });
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
    <Screen style={{ backgroundColor: Colors.dark }}>
      <StatusBar style="light" />
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

        {/* Analysis shortcuts + view toggle */}
        <View style={styles.tools}>
          <Pressable
            onPress={() => hasPro ? router.push('/kuber/sammenlign' as any) : openProUpgrade()}
            style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.65 }]}
          >
            <Text style={styles.toolText}>{hasPro ? '📊 Sammenlign' : '🔒 Sammenlign'}</Text>
          </Pressable>
          <Pressable
            onPress={() => hasPro ? router.push('/kuber/sesongsammenligning' as any) : openProUpgrade()}
            style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.65 }]}
          >
            <Text style={styles.toolText}>{hasPro ? '📈 Sesong' : '🔒 Sesong'}</Text>
          </Pressable>
          <View style={styles.viewToggle}>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              accessibilityLabel="Listevisning"
            >
              <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>☰</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('map')}
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
              accessibilityLabel="Kartvisning"
            >
              <Text style={[styles.toggleBtnText, viewMode === 'map' && styles.toggleBtnTextActive]}>🗺</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {viewMode === 'map' ? (
        <HivesMapView />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.honey} />
          }
          renderItem={({ item }) => (
            <Pressable onLongPress={() => handleDelete(item)} delayLongPress={600}>
              <HiveCard
                hive={item}
                lastInspection={lastInspectionByHive[item.id]}
                onPress={() => router.push({ pathname: '/kuber/[id]' as any, params: { id: item.id } })}
              />
            </Pressable>
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
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          if (isStarter && hives.length >= STARTER_HIVE_LIMIT) {
            setUpgradeCopy({
              title: 'Oppgrader for flere kuber',
              subtitle: 'Starter er begrenset til 3 kuber. Oppgrader for ubegrenset antall.',
            });
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
        title={upgradeCopy.title}
        subtitle={upgradeCopy.subtitle}
      />
    </Screen>
  );
}


const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: Colors.dark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    fontFamily: FontFamily.extrabold,
    letterSpacing: 1.4,
    color: Colors.honey,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  summaryStrong: {
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
  summaryMid: {
    color: 'rgba(255,255,255,0.45)',
  },

  chips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
  },
  tools: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 8,
    alignItems: 'center',
  },
  toolBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.70)',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honey,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: 'rgba(255,255,255,0.70)',
  },
  chipTextActive: {
    color: Colors.dark,
  },
  chipCount: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: 'rgba(255,255,255,0.45)',
  },
  chipCountActive: {
    color: Colors.dark,
  },

  viewToggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleBtnActive: {
    backgroundColor: Colors.honey,
  },
  toggleBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
  },
  toggleBtnTextActive: {
    color: Colors.dark,
  },
  list: { padding: 20, gap: 12, paddingBottom: 100 },
  emptyList: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.white },
  emptyText: { fontSize: 14, fontFamily: FontFamily.regular, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, maxWidth: 260 },

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
    ...Shadows.fab,
  },
  fabPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  fabText: { fontSize: 28, fontFamily: FontFamily.bold, color: Colors.dark, fontWeight: '700', lineHeight: 32 },
});
