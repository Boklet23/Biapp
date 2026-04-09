import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { fetchHives } from '@/services/hive';
import { fetchAllInspections } from '@/services/inspection';
import { fetchHarvests } from '@/services/harvest';
import { Inspection, HarvestRecord } from '@/types';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

function monthlyAvg(inspections: Inspection[], year: number, field: 'varroaCount'): (number | null)[] {
  return Array.from({ length: 12 }, (_, m) => {
    const relevant = inspections.filter((i) => {
      const d = new Date(i.inspectedAt);
      return d.getFullYear() === year && d.getMonth() === m && i[field] != null;
    });
    if (relevant.length === 0) return null;
    return relevant.reduce((s, i) => s + (i[field] ?? 0), 0) / relevant.length;
  });
}

function monthlyHarvest(harvests: HarvestRecord[], year: number): (number | null)[] {
  return Array.from({ length: 12 }, (_, m) => {
    const relevant = harvests.filter((h) => {
      const d = new Date(h.harvestedAt);
      return d.getFullYear() === year && d.getMonth() === m;
    });
    if (relevant.length === 0) return null;
    return relevant.reduce((s, h) => s + h.quantityKg, 0);
  });
}

interface YearLineChartProps {
  data: { year: number; values: (number | null)[]; color: string }[];
  title: string;
  unit: string;
}

function YearLineChart({ data, title, unit }: YearLineChartProps) {
  const { width } = useWindowDimensions();
  const chartW = width - 80;
  const chartH = 100;
  const padX = 30;
  const padY = 10;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2 - 14;

  const allVals = data.flatMap((d) => d.values.filter((v) => v != null)) as number[];
  if (allVals.length < 2) return null;

  const maxVal = Math.max(...allVals, 1);

  return (
    <View style={chart.wrap}>
      <Text style={chart.title}>{title}</Text>
      <View style={chart.legend}>
        {data.map((d) => (
          <View key={d.year} style={chart.legendItem}>
            <View style={[chart.legendDot, { backgroundColor: d.color }]} />
            <Text style={chart.legendText}>{d.year}</Text>
          </View>
        ))}
      </View>
      <Svg width={chartW} height={chartH}>
        <Line x1={padX} y1={padY + innerH} x2={padX + innerW} y2={padY + innerH} stroke={Colors.mid + '30'} strokeWidth={1} />
        {data.map((dataset) => {
          const pts = dataset.values
            .map((v, i) => (v != null ? { x: padX + (i / 11) * innerW, y: padY + innerH - (v / maxVal) * innerH, v } : null))
            .filter(Boolean) as { x: number; y: number; v: number }[];

          const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');

          return (
            <Polyline key={dataset.year} points={poly} fill="none" stroke={dataset.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          );
        })}
        {MONTHS_SHORT.map((m, i) => (
          <SvgText key={m} x={padX + (i / 11) * innerW} y={chartH - 1} fontSize={8} fill={Colors.mid} textAnchor="middle">{m}</SvgText>
        ))}
      </Svg>
      <Text style={chart.unit}>{unit}</Text>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 16, ...Shadows.card },
  title: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 4, borderRadius: 2 },
  legendText: { fontSize: 11, color: Colors.mid },
  unit: { fontSize: 10, color: Colors.mid, marginTop: 4, textAlign: 'right' },
});

const YEAR_COLORS = [Colors.honey, Colors.info, Colors.success, '#9B59B6'];

export default function SesongSammenligning() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const { data: hives = [] } = useQuery({ queryKey: ['hives'], queryFn: fetchHives });
  const { data: inspections = [] } = useQuery({ queryKey: ['all-inspections'], queryFn: fetchAllInspections });
  const { data: harvests = [] } = useQuery({ queryKey: ['harvests'], queryFn: fetchHarvests });

  const activeHives = hives.filter((h) => h.isActive);

  const varroaSeries = useMemo(() =>
    years.map((y, i) => ({
      year: y,
      values: monthlyAvg(inspections, y, 'varroaCount'),
      color: YEAR_COLORS[i],
    })), [inspections, years]);

  const harvestSeries = useMemo(() =>
    years.map((y, i) => ({
      year: y,
      values: monthlyHarvest(harvests, y),
      color: YEAR_COLORS[i],
    })), [harvests, years]);

  const yearStats = useMemo(() =>
    years.map((y) => {
      const yearInsp = inspections.filter((i) => i.inspectedAt.startsWith(String(y)));
      const yearHarvest = harvests.filter((h) => h.harvestedAt.startsWith(String(y)));
      const totalKg = yearHarvest.reduce((s, h) => s + h.quantityKg, 0);
      const avgVarroa = yearInsp.filter((i) => i.varroaCount != null);
      const varroaMean = avgVarroa.length > 0
        ? Math.round(avgVarroa.reduce((s, i) => s + (i.varroaCount ?? 0), 0) / avgVarroa.length * 10) / 10
        : null;
      return { year: y, inspCount: yearInsp.length, totalKg: Math.round(totalKg * 10) / 10, varroaMean };
    }), [inspections, harvests, years]);

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>År-over-år sammenligning</Text>
        <Text style={styles.sub}>{activeHives.length} aktive kuber · alle data samlet</Text>

        {/* Stats-tabell */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={[styles.statsCell, styles.statsCellHeader]}>År</Text>
            <Text style={[styles.statsCell, styles.statsCellHeader]}>Inspeksjoner</Text>
            <Text style={[styles.statsCell, styles.statsCellHeader]}>Honning kg</Text>
            <Text style={[styles.statsCell, styles.statsCellHeader]}>Snitt varroa</Text>
          </View>
          {yearStats.map((s, i) => (
            <View key={s.year} style={[styles.statsRow, i < yearStats.length - 1 && styles.statsRowBorder]}>
              <View style={[styles.statsCell, styles.yearCell]}>
                <View style={[styles.yearDot, { backgroundColor: YEAR_COLORS[i] }]} />
                <Text style={styles.yearText}>{s.year}</Text>
              </View>
              <Text style={styles.statsCell}>{s.inspCount}</Text>
              <Text style={[styles.statsCell, { color: Colors.honey, fontWeight: '700' }]}>
                {s.totalKg > 0 ? `${s.totalKg} kg` : '–'}
              </Text>
              <Text style={styles.statsCell}>{s.varroaMean != null ? s.varroaMean : '–'}</Text>
            </View>
          ))}
        </View>

        <YearLineChart data={varroaSeries} title="Varroa — månedlig gjennomsnitt" unit="ant. mitter per 100 bier" />
        <YearLineChart data={harvestSeries} title="Honninghøsting — per måned (alle kuber)" unit="kg" />

        {inspections.length < 2 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>Mer data trengs for meningsfulle grafer.</Text>
            <Text style={styles.emptySub}>Logg minst 5 inspeksjoner over to sesonger.</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  header: { fontSize: 24, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  sub: { fontSize: 13, color: Colors.mid, marginBottom: 20 },
  statsCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', marginBottom: 16, ...Shadows.card },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10 },
  statsRowBorder: { borderTopWidth: 1, borderTopColor: Colors.mid + '12' },
  statsCell: { flex: 1, fontSize: 13, color: Colors.dark, textAlign: 'center' },
  statsCellHeader: { fontSize: 11, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.5 },
  yearCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  yearDot: { width: 10, height: 10, borderRadius: 5 },
  yearText: { fontSize: 13, fontWeight: '700', color: Colors.dark },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  emptySub: { fontSize: 13, color: Colors.mid },
});
