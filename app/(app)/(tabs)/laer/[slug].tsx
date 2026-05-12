import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { SeverityBadge } from '@/components/disease/SeverityBadge';
import { PhotoStrip } from '@/components/disease/PhotoStrip';
import { Colors } from '@/constants/colors';
import { DISEASES } from '@/constants/diseases';
import { fetchDiseaseBySlug } from '@/services/diseases';
import { SeasonalTip } from '@/types';

const SEASON_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  'Vår':    { emoji: '🌸', color: '#2e7d32', bg: '#f1f8e9' },
  'Sommer': { emoji: '☀️', color: '#e65100', bg: '#fff8e1' },
  'Høst':   { emoji: '🍂', color: '#bf360c', bg: '#fbe9e7' },
  'Vinter': { emoji: '❄️', color: '#0277bd', bg: '#e1f5fe' },
};

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

function SeasonCard({ item }: { item: SeasonalTip }) {
  const cfg = SEASON_CONFIG[item.season] ?? { emoji: '📅', color: Colors.mid, bg: Colors.light };
  return (
    <View style={[styles.seasonCard, { borderLeftColor: cfg.color, backgroundColor: cfg.bg }]}>
      <Text style={[styles.seasonTitle, { color: cfg.color }]}>
        {cfg.emoji} {item.season}
      </Text>
      {item.tips.map((tip, i) => (
        <View key={i} style={styles.tipRow}>
          <Text style={[styles.tipBullet, { color: cfg.color }]}>•</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DiseaseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const fallback = DISEASES.find((d) => d.slug === slug);

  const { data: disease } = useQuery({
    queryKey: ['disease', slug],
    queryFn: () => fetchDiseaseBySlug(slug),
    placeholderData: fallback ?? null,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    enabled: !!slug,
  });

  if (!disease) {
    return (
      <Screen>
        <Text style={styles.notFound}>Sykdom ikke funnet</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {disease.isNotifiable && (
          <View style={styles.notifiableBanner}>
            <Text style={styles.notifiableText}>
              ⚠️ Meldepliktig sykdom — kontakt Mattilsynet umiddelbart ved mistanke (22 40 00 00)
            </Text>
          </View>
        )}

        <Text style={styles.name}>{disease.nameNo}</Text>

        <View style={styles.badgeRow}>
          <SeverityBadge severity={disease.severity} notifiable={disease.isNotifiable} />
        </View>

        {disease.goal && (
          <View style={styles.goalBox}>
            <Text style={styles.goalLabel}>MÅL</Text>
            <Text style={styles.goalText}>{disease.goal}</Text>
          </View>
        )}

        <Section title="Beskrivelse">{disease.description}</Section>

        {disease.photos.length > 0 && <PhotoStrip photos={disease.photos} />}

        <Section title="Symptomer">{disease.symptoms}</Section>

        {disease.seasonalTreatment && disease.seasonalTreatment.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sesongvis behandling</Text>
            <View style={styles.seasonGrid}>
              {disease.seasonalTreatment.map((item) => (
                <SeasonCard key={item.season} item={item} />
              ))}
            </View>
          </View>
        ) : (
          <Section title="Behandling">{disease.treatment}</Section>
        )}

        <Section title="Forebygging">{disease.prevention}</Section>

        {disease.diagnosticTips && (
          <View style={styles.diagnosticBox}>
            <Text style={styles.sectionTitle}>Diagnostiske tips</Text>
            <Text style={styles.sectionText}>{disease.diagnosticTips}</Text>
          </View>
        )}

        {disease.sources && (
          <Text style={styles.sources}>Kilder: {disease.sources}</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 0 },
  notFound: { padding: 20, fontSize: 16, color: Colors.mid },

  notifiableBanner: {
    backgroundColor: '#FADBD8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.notifiable,
  },
  notifiableText: { fontSize: 14, fontWeight: '700', color: Colors.notifiable, lineHeight: 20 },

  name: { fontSize: 26, fontWeight: '800', color: Colors.dark, marginBottom: 12 },
  badgeRow: { marginBottom: 20 },

  goalBox: {
    backgroundColor: Colors.honey + '12',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.honey,
    marginBottom: 24,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.honey,
    letterSpacing: 1,
    marginBottom: 6,
  },
  goalText: { fontSize: 14, color: Colors.dark, lineHeight: 21 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionText: { fontSize: 15, color: Colors.dark, lineHeight: 23 },

  seasonGrid: { gap: 10 },
  seasonCard: {
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    gap: 6,
  },
  seasonTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBullet: { fontSize: 15, lineHeight: 22, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, color: Colors.dark, lineHeight: 21 },

  diagnosticBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },

  sources: {
    fontSize: 12,
    color: Colors.mid + 'aa',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});
