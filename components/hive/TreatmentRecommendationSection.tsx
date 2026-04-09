import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';
import { Inspection, Treatment } from '@/types';

interface Rec {
  icon: string;
  title: string;
  detail: string;
  urgency: 'info' | 'warn' | 'critical';
}

function getRecommendations(
  inspections: Inspection[],
  treatments: Treatment[],
  month: number
): Rec[] {
  const recs: Rec[] = [];

  const sorted = [...inspections].sort(
    (a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime()
  );
  const latest = sorted[0];

  // Varroa-basert anbefaling
  if (latest?.varroaCount != null) {
    if (latest.varroaCount >= 6) {
      recs.push({
        icon: '🚨',
        title: 'Behandling nødvendig',
        detail: `Varroatall ${latest.varroaCount} overskrider terskelen (5). Vurder oxalsyre-fordamping eller Apivar umiddelbart.`,
        urgency: 'critical',
      });
    } else if (latest.varroaCount >= 3) {
      recs.push({
        icon: '👁',
        title: 'Følg med på varroa',
        detail: `Varroatall ${latest.varroaCount} nærmer seg terskelen. Tell igjen om 2 uker.`,
        urgency: 'warn',
      });
    }
  }

  // Vårgjennomgang (april–mai)
  if (month === 4 || month === 5) {
    recs.push({
      icon: '🌱',
      title: 'Vårgjennomgang',
      detail: 'Kontroller yngelmønster, romsbehov og dronningkvalitet. Fjern vintertapet og vurder avleggere.',
      urgency: 'info',
    });
  }

  // Sverm-forebygging (mai–juni)
  if (month === 5 || month === 6) {
    recs.push({
      icon: '🐝',
      title: 'Sverm-forebygging',
      detail: 'Sjekk for dronningceller ukentlig. Tilsett rom ved behov. Vurder avlegger-dannelse.',
      urgency: 'info',
    });
  }

  // Høstbehandling (august–september)
  if (month >= 8 && month <= 9) {
    const hasRecentTreatment = treatments.some((t) => {
      const m = new Date(t.treatedAt).getMonth() + 1;
      return m >= 7 && m <= 9;
    });
    if (!hasRecentTreatment) {
      recs.push({
        icon: '🍂',
        title: 'Høstbehandling mot varroa',
        detail: 'Etter honninghøsting er det optimalt å behandle med Apivar (8 uker) eller oxalsyre-fordamping.',
        urgency: 'warn',
      });
    }
  }

  // Vinterklargjøring (september–oktober)
  if (month === 9 || month === 10) {
    recs.push({
      icon: '❄️',
      title: 'Vinterklargjøring',
      detail: 'Sjekk mattilgang, tett inntil, ventilasjon og mus-sikring. Siste varroatelling for sesongen.',
      urgency: 'info',
    });
  }

  // Vinterbehandling oxalsyre (desember–januar)
  if (month === 12 || month === 1) {
    const hasWinterTreatment = treatments.some((t) => {
      const m = new Date(t.treatedAt).getMonth() + 1;
      return m === 12 || m === 1;
    });
    if (!hasWinterTreatment) {
      recs.push({
        icon: '💉',
        title: 'Vinterbehandling (oxalsyre)',
        detail: 'Yngelfri koloni gir ideal effekt av oxalsyre-drypp. Reduserer varroa med >90 %.',
        urgency: 'warn',
      });
    }
  }

  return recs;
}

const URGENCY_COLOR: Record<Rec['urgency'], string> = {
  info: Colors.info,
  warn: '#E67E22',
  critical: Colors.error,
};

const URGENCY_BG: Record<Rec['urgency'], string> = {
  info: Colors.info + '12',
  warn: '#E67E2212',
  critical: Colors.error + '12',
};

interface TreatmentRecommendationSectionProps {
  inspections: Inspection[];
  treatments: Treatment[];
}

export function TreatmentRecommendationSection({
  inspections,
  treatments,
}: TreatmentRecommendationSectionProps) {
  const month = new Date().getMonth() + 1;
  const recs = useMemo(
    () => getRecommendations(inspections, treatments, month),
    [inspections, treatments, month]
  );

  if (recs.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Anbefalinger</Text>
      <Text style={styles.disclaimer}>Generelle råd — ikke erstatning for faglig veiledning.</Text>
      <View style={styles.list}>
        {recs.map((rec, i) => (
          <View
            key={i}
            style={[
              styles.card,
              { backgroundColor: URGENCY_BG[rec.urgency], borderLeftColor: URGENCY_COLOR[rec.urgency] },
              i < recs.length - 1 && styles.cardBorder,
            ]}
          >
            <Text style={styles.recIcon}>{rec.icon}</Text>
            <View style={styles.recContent}>
              <Text style={[styles.recTitle, { color: URGENCY_COLOR[rec.urgency] }]}>{rec.title}</Text>
              <Text style={styles.recDetail}>{rec.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  list: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadows.card,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    alignItems: 'flex-start',
  },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '10' },
  recIcon: { fontSize: 20, marginTop: 1 },
  recContent: { flex: 1, gap: 3 },
  recTitle: { fontSize: 14, fontWeight: '700' },
  recDetail: { fontSize: 13, color: Colors.mid, lineHeight: 18 },
  disclaimer: { fontSize: 11, color: Colors.mid, marginBottom: 8, fontStyle: 'italic' },
});
