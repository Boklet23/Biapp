import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { ArticleCard } from '@/components/info/ArticleCard';
import { DiseaseCard } from '@/components/disease/DiseaseCard';
import { HoneyForecastChart } from '@/components/info/HoneyForecastChart';
import { HarvestLogModal } from '@/components/info/HarvestLogModal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors } from '@/constants/colors';
import { GUIDE_ARTICLES } from '@/constants/beginnerGuide';
import { DISEASES } from '@/constants/diseases';
import { fetchHives } from '@/services/hive';
import { fetchHarvests, createHarvest, deleteHarvest } from '@/services/harvest';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function Info() {
  const [query, setQuery] = useState('');
  const [harvestModalVisible, setHarvestModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const profile = useAuthStore((s) => s.profile);
  const { show: showToast } = useToastStore();
  const queryClient = useQueryClient();

  const { data: hives = [] } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
  });

  const { data: harvests = [] } = useQuery({
    queryKey: ['harvests'],
    queryFn: fetchHarvests,
  });

  const activeHives = hives.filter((h) => h.isActive);
  const activeHiveCount = activeHives.length;

  const createMutation = useMutation({
    mutationFn: (args: { hiveId: string; harvestedAt: string; quantityKg: number; notes: string }) =>
      createHarvest({ hiveId: args.hiveId, harvestedAt: args.harvestedAt, quantityKg: args.quantityKg, notes: args.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      setHarvestModalVisible(false);
      showToast('Høst registrert!', 'success');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      showToast('Høst slettet', 'info');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  const filteredDiseases = useMemo(() => {
    if (!query.trim()) return DISEASES;
    const q = query.toLowerCase();
    return DISEASES.filter(
      (d) =>
        d.nameNo.toLowerCase().includes(q) ||
        d.symptoms.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Info</Text>

        <SectionTitle>Honningprognose</SectionTitle>
        <HoneyForecastChart
          activeHiveCount={activeHiveCount}
          hives={activeHives}
          harvests={harvests}
          subscriptionTier={profile?.subscriptionTier ?? 'starter'}
          onLogHarvest={() => setHarvestModalVisible(true)}
          onDeleteHarvest={(id) => deleteMutation.mutate(id)}
          onUpgrade={() => setUpgradeModalVisible(true)}
        />

        <SectionTitle>Nybegynnerguide</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.articleScroll}
        >
          {GUIDE_ARTICLES.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              onPress={() =>
                router.push({
                  pathname: '/laer/guide/[slug]',
                  params: { slug: article.slug },
                } as any)
              }
            />
          ))}
        </ScrollView>

        <SectionTitle>Sykdomsguide</SectionTitle>
        <Text style={styles.sub}>10 vanlige tilstander i norsk birøkt</Text>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Søk på sykdom eller symptom..."
          placeholderTextColor={Colors.mid + '80'}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />

        {filteredDiseases.length === 0 ? (
          <Text style={styles.empty}>Ingen treff for «{query}»</Text>
        ) : (
          filteredDiseases.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onPress={() =>
                router.push({
                  pathname: '/laer/[slug]',
                  params: { slug: disease.slug },
                } as any)
              }
            />
          ))
        )}
      </ScrollView>

      <HarvestLogModal
        visible={harvestModalVisible}
        hives={activeHives}
        onClose={() => setHarvestModalVisible(false)}
        onSubmit={(hiveId, harvestedAt, quantityKg, notes) =>
          createMutation.mutate({ hiveId, harvestedAt, quantityKg, notes })
        }
        loading={createMutation.isPending}
      />

      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 12, gap: 12, paddingBottom: 32 },
  header: { fontSize: 28, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
  },
  articleScroll: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  sub: { fontSize: 13, color: Colors.mid, marginTop: -6, marginBottom: 4 },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  empty: { fontSize: 14, color: Colors.mid, textAlign: 'center', marginTop: 12 },
});
