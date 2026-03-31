import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Inspection } from '@/types';

interface SeasonSummaryCardProps {
  inspections: Inspection[];
  activeHiveCount: number;
  lastInspectionByHive: Record<string, Inspection>;
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SeasonSummaryCard({
  inspections,
  activeHiveCount,
  lastInspectionByHive,
}: SeasonSummaryCardProps) {
  const currentYear = String(new Date().getFullYear());

  const yearInspections = inspections.filter((i) =>
    i.inspectedAt.startsWith(currentYear)
  );

  const varroaCounts = yearInspections
    .filter((i) => i.varroaCount != null)
    .map((i) => i.varroaCount!);
  const avgVarroa =
    varroaCounts.length > 0
      ? Math.round(
          (varroaCounts.reduce((s, v) => s + v, 0) / varroaCounts.length) * 10
        ) / 10
      : null;

  const queenSeenCount = Object.values(lastInspectionByHive).filter(
    (i) => i.queenSeen
  ).length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sesong {currentYear}</Text>
      <View style={styles.row}>
        <Stat label="Inspeksjoner" value={String(yearInspections.length)} />
        <View style={styles.divider} />
        <Stat
          label="Gj.snitt varroa"
          value={avgVarroa != null ? String(avgVarroa) : '—'}
        />
        <View style={styles.divider} />
        <Stat
          label="Dronning sett"
          value={
            activeHiveCount > 0 ? `${queenSeenCount}/${activeHiveCount}` : '—'
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.honeyDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.mid,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.mid + '20',
  },
});
