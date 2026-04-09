import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';
import { Inspection } from '@/types';

function computeScore(inspections: Inspection[]): { score: number; label: string; issues: string[] } {
  if (inspections.length === 0) {
    return { score: 50, label: 'Ukjent', issues: ['Ingen inspeksjoner registrert ennå'] };
  }

  const sorted = [...inspections].sort(
    (a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime()
  );
  const latest = sorted[0];
  const daysSinceLast = Math.floor((Date.now() - new Date(latest.inspectedAt).getTime()) / 86400000);

  let score = 100;
  const issues: string[] = [];

  if (daysSinceLast > 30) {
    score -= 20;
    issues.push(`Ikke inspisert på ${daysSinceLast} dager`);
  } else if (daysSinceLast > 14) {
    score -= 8;
    issues.push(`Siste inspeksjon for ${daysSinceLast} dager siden`);
  }

  if (!latest.queenSeen) {
    score -= 15;
    issues.push('Dronning ikke sett siste inspeksjon');
  }

  if (latest.varroaCount != null) {
    if (latest.varroaCount > 8) {
      score -= 25;
      issues.push(`Høyt varroafall (${latest.varroaCount})`);
    } else if (latest.varroaCount > 5) {
      score -= 15;
      issues.push(`Forhøyet varroafall (${latest.varroaCount})`);
    } else if (latest.varroaCount > 3) {
      score -= 5;
      issues.push(`Moderat varroafall (${latest.varroaCount})`);
    }
  }

  if (latest.moodScore === 1) {
    score -= 20;
    issues.push('Aggressiv koloni siste inspeksjon');
  } else if (latest.moodScore === 2) {
    score -= 10;
    issues.push('Urolig koloni siste inspeksjon');
  }

  const recent3 = sorted.slice(0, 3);
  if (recent3.some((i) => i.queenCellsFound)) {
    score -= 10;
    issues.push('Dronningceller funnet nylig');
  }

  score = Math.max(0, Math.min(100, score));

  let label: string;
  if (score >= 90) label = 'Utmerket';
  else if (score >= 75) label = 'Bra';
  else if (score >= 60) label = 'Moderat';
  else if (score >= 40) label = 'Bekymringsfullt';
  else label = 'Kritisk';

  return { score, label, issues };
}

function scoreColor(score: number): string {
  if (score >= 90) return Colors.success;
  if (score >= 75) return '#5DB346';
  if (score >= 60) return Colors.honey;
  if (score >= 40) return '#E67E22';
  return Colors.error;
}

interface HealthScoreSectionProps {
  inspections: Inspection[];
}

export function HealthScoreSection({ inspections }: HealthScoreSectionProps) {
  const { score, label, issues } = useMemo(() => computeScore(inspections), [inspections]);
  const color = scoreColor(score);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Helsestatus</Text>
      <View style={styles.card}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {issues.length > 0 ? (
          <View style={styles.issueList}>
            {issues.map((issue, i) => (
              <View key={i} style={styles.issueRow}>
                <Text style={styles.issueIcon}>⚠️</Text>
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.allGoodRow}>
            <Text style={styles.allGoodIcon}>✅</Text>
            <Text style={styles.allGoodText}>Ingen problemer oppdaget</Text>
          </View>
        )}
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    ...Shadows.card,
  },
  label: { fontSize: 16, fontWeight: '700' },
  issueList: { gap: 6, borderTopWidth: 1, borderTopColor: Colors.mid + '12', paddingTop: 12 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  issueIcon: { fontSize: 14 },
  issueText: { fontSize: 13, color: Colors.mid, flex: 1, lineHeight: 18 },
  allGoodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allGoodIcon: { fontSize: 16 },
  allGoodText: { fontSize: 13, color: Colors.success, fontWeight: '600' },
});
