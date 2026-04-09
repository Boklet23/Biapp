import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { MOOD_EMOJI } from '@/constants/ui';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections } from '@/services/inspection';
import { Hive, Inspection } from '@/types';

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function InspCell({ value }: { value: string }) {
  return <Text style={styles.cell}>{value}</Text>;
}

interface Row {
  hive: Hive;
  last: Inspection | undefined;
}

export default function SammenlignKuber() {
  const { data: hives = [] } = useQuery({ queryKey: ['hives'], queryFn: fetchHives });
  const { data: allInspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: fetchAllInspections,
  });

  const lastByHive = allInspections.reduce<Record<string, Inspection>>((acc, insp) => {
    const existing = acc[insp.hiveId];
    if (!existing || insp.inspectedAt > existing.inspectedAt) acc[insp.hiveId] = insp;
    return acc;
  }, {});

  const rows: Row[] = hives
    .filter((h) => h.isActive)
    .map((hive) => ({ hive, last: lastByHive[hive.id] }))
    .sort((a, b) => {
      const dA = a.last?.inspectedAt ?? '';
      const dB = b.last?.inspectedAt ?? '';
      return dA < dB ? -1 : dA > dB ? 1 : 0;
    });

  if (rows.length === 0) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐝</Text>
          <Text style={styles.emptyText}>Ingen aktive kuber å sammenligne</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header row */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.nameCell, styles.headerText]}>Kube</Text>
              <Text style={[styles.cell, styles.headerText]}>Inspisert</Text>
              <Text style={[styles.cell, styles.headerText]}>Varroa</Text>
              <Text style={[styles.cell, styles.headerText]}>Yngel</Text>
              <Text style={[styles.cell, styles.headerText]}>Humør</Text>
            </View>

            {/* Data rows */}
            {rows.map(({ hive, last }, idx) => {
              const days = last ? daysSince(last.inspectedAt) : null;
              const inspLabel = days === null
                ? '—'
                : days === 0 ? 'I dag'
                : days === 1 ? 'I går'
                : `${days}d`;
              const overdue = days === null || days >= 14;

              return (
                <View
                  key={hive.id}
                  style={[styles.row, idx % 2 === 0 && styles.rowEven]}
                >
                  <Text style={styles.nameCell} numberOfLines={1}>{hive.name}</Text>
                  <Text style={[styles.cell, overdue && styles.overdueText]}>{inspLabel}</Text>
                  <InspCell value={last?.varroaCount != null ? String(last.varroaCount) : '—'} />
                  <InspCell value={last?.numFramesBrood != null ? String(last.numFramesBrood) : '—'} />
                  <InspCell value={last?.moodScore != null ? MOOD_EMOJI[last.moodScore] : '—'} />
                </View>
              );
            })}
          </View>
        </ScrollView>

        <Text style={styles.hint}>* Sortert etter lengst tid siden siste inspeksjon</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },

  headerRow: {
    backgroundColor: Colors.honey + '18',
    borderRadius: 10,
    marginBottom: 2,
  },
  headerText: {
    fontWeight: '700',
    color: Colors.dark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 0,
  },
  rowEven: {
    backgroundColor: Colors.light,
  },
  nameCell: {
    width: 110,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
    paddingRight: 8,
  },
  cell: {
    width: 70,
    fontSize: 13,
    color: Colors.dark,
    textAlign: 'center',
  },
  overdueText: {
    color: Colors.warning,
    fontWeight: '700',
  },

  hint: {
    marginTop: 16,
    fontSize: 11,
    color: Colors.mid,
    fontStyle: 'italic',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: Colors.mid },
});
