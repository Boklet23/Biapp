import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { SeverityBadge } from '@/components/disease/SeverityBadge';
import { PhotoStrip } from '@/components/disease/PhotoStrip';
import { Colors } from '@/constants/colors';
import { DISEASES } from '@/constants/diseases';

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

export default function DiseaseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const disease = DISEASES.find((d) => d.slug === slug);

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
              ⚠️ Meldepliktig sykdom — kontakt Mattilsynet umiddelbart ved mistanke
            </Text>
          </View>
        )}

        <Text style={styles.name}>{disease.nameNo}</Text>

        <View style={styles.badgeRow}>
          <SeverityBadge severity={disease.severity} notifiable={disease.isNotifiable} />
        </View>

        <Section title="Beskrivelse">{disease.description}</Section>

        <PhotoStrip photos={disease.photos} />

        <Section title="Symptomer">{disease.symptoms}</Section>
        <Section title="Behandling">{disease.treatment}</Section>
        <Section title="Forebygging">{disease.prevention}</Section>
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
  notifiableText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.notifiable,
    lineHeight: 20,
  },

  name: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 12,
  },
  badgeRow: { marginBottom: 24 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 23,
  },
});
