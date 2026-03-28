import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/colors';
import { fetchInspection } from '@/services/inspection';

const MOOD_EMOJI = ['', '😟', '😐', '😊', '😁', '🤩'];
const MOOD_LABEL = ['', 'Bekymret', 'Nøytral', 'Bra', 'Flott', 'Strålende'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, value ? styles.yes : styles.no]}>
        {value ? 'Ja' : 'Nei'}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function VisInspeksjon() {
  const { inspId } = useLocalSearchParams<{ id: string; inspId: string }>();

  const { data: insp, isLoading } = useQuery({
    queryKey: ['inspection', inspId],
    queryFn: () => fetchInspection(inspId),
  });

  if (isLoading || !insp) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Laster inspeksjon...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dateHeader}>{formatDate(insp.inspectedAt)}</Text>

        {insp.moodScore != null && (
          <View style={styles.moodBanner}>
            <Text style={styles.moodBig}>{MOOD_EMOJI[insp.moodScore]}</Text>
            <Text style={styles.moodBigLabel}>{MOOD_LABEL[insp.moodScore]}</Text>
          </View>
        )}

        <Section title="Grunninfo">
          <Row label="Temperatur" value={insp.weatherTemp != null ? `${insp.weatherTemp}°C` : null} />
          <Row label="Vær" value={insp.weatherCondition} />
        </Section>

        <Section title="Kubestatus">
          <Row label="Yngelrammer" value={insp.numFramesBrood} />
          <Row label="Honningrammer" value={insp.numFramesHoney} />
          <Row label="Tomme rammer" value={insp.numFramesEmpty} />
          <BoolRow label="Dronning sett" value={insp.queenSeen} />
          <BoolRow label="Dronningceller" value={insp.queenCellsFound} />
        </Section>

        <Section title="Helse">
          <Row label="Varroa-telling" value={insp.varroaCount} />
          <Row label="Metode" value={insp.varroaMethod} />
          <BoolRow label="Behandling utført" value={insp.treatmentApplied} />
          {insp.treatmentApplied && (
            <Row label="Produkt" value={insp.treatmentProduct} />
          )}
        </Section>

        {insp.notes && (
          <Section title="Notater">
            <Text style={styles.notesText}>{insp.notes}</Text>
          </Section>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40, gap: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, color: Colors.mid },

  dateHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 16,
    textTransform: 'capitalize',
  },

  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.amber,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  moodBig: { fontSize: 36 },
  moodBigLabel: { fontSize: 18, fontWeight: '700', color: Colors.honeyDark },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '12',
  },
  rowLabel: { fontSize: 15, color: Colors.mid },
  rowValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  yes: { color: Colors.success },
  no: { color: Colors.mid },

  notesText: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 22,
    paddingVertical: 14,
  },
});
