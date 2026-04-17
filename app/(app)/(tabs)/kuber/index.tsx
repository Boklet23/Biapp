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
import { fetchInspections } from '@/services/inspection';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { Hive } from '@/types';

const STARTER_HIVE_LIMIT = 3;

export default function KuberOversikt() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const showToast = useToastStore((s) => s.show);
  const profile = useAuthStore((s) => s.profile);
  const isStarter = (profile?.subscriptionTier ?? 'starter') === 'starter';

  const { data: hives = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
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
            style={({ pressed }) => [styles.compareBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.compareBtnText}>Prøv igjen</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <BeeParticles height={70} />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mine Kuber</Text>
            <Text style={styles.count}>{hives.length} {hives.length === 1 ? 'kube' : 'kuber'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {hives.length >= 2 && (
              <Pressable
                style={({ pressed }) => [styles.compareBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/kuber/sammenlign' as any)}
                accessibilityRole="button"
                accessibilityLabel="Sammenlign kuber"
              >
                <Text style={styles.compareBtnText}>Sammenlign</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.compareBtn, { backgroundColor: Colors.mid + '20' }, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/kuber/sesongsammenligning' as any)}
              accessibilityRole="button"
              accessibilityLabel="Sesong-sammenligning"
            >
              <Text style={[styles.compareBtnText, { color: Colors.mid }]}>📊 År-over-år</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={hives}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, hives.length === 0 && styles.emptyList]}
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
            <Text style={styles.emptyTitle}>Ingen kuber ennå</Text>
            <Text style={styles.emptyText}>
              Trykk + for å legge til din første bikube
            </Text>
          </View>
        }
      />

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
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  count: { fontSize: 14, color: Colors.mid },
  compareBtn: {
    backgroundColor: Colors.honey + '18',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.honey + '40',
  },
  compareBtnText: { fontSize: 13, fontWeight: '600', color: Colors.honey },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.honeyDark + '20',
  },
  fabPressed: { transform: [{ scale: 0.92 }], opacity: 0.85 },
  fabText: { fontSize: 28, color: Colors.white, fontWeight: '400', lineHeight: 32 },
});
