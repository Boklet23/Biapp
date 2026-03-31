import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { HarvestRecord, Hive } from '@/types';

// Norwegian seasonal honey production distribution (% of annual yield per month)
const SEASONAL_FACTORS: Record<number, number> = {
  1: 0.00, 2: 0.00, 3: 0.00, 4: 0.01,
  5: 0.05, 6: 0.12, 7: 0.30, 8: 0.35,
  9: 0.12, 10: 0.05, 11: 0.00, 12: 0.00,
};

const DEFAULT_KG_PER_HIVE_PER_YEAR = 20;

// Average annual honey yield per bee breed (kg/year in Norwegian conditions)
const BREED_KG_PER_YEAR: Record<string, number> = {
  norsk_landbee: 16,
  buckfast:      25,
  carniolan:     22,
  annet:         20,
};

function avgYieldForHives(hives: Hive[]): number {
  if (hives.length === 0) return DEFAULT_KG_PER_HIVE_PER_YEAR;
  const total = hives.reduce((sum, h) => sum + (BREED_KG_PER_YEAR[h.beeBreed ?? 'annet'] ?? DEFAULT_KG_PER_HIVE_PER_YEAR), 0);
  return total / hives.length;
}

const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

type BarType = 'actual' | 'forecast' | 'current';

interface MonthData {
  month: number;
  year: number;
  label: string;
  kg: number;
  barType: BarType;
  harvestId: string | null; // set if kg comes from a logged harvest
}

interface HoneyForecastChartProps {
  activeHiveCount: number;
  hives: Hive[];
  harvests: HarvestRecord[];
  subscriptionTier: string;
  onLogHarvest: () => void;
  onDeleteHarvest: (id: string) => void;
}

function buildChartData(
  activeHiveCount: number,
  hives: Hive[],
  harvests: HarvestRecord[],
): MonthData[] {
  const avgYield = avgYieldForHives(hives);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Build a map: 'YYYY-MM' → harvest for fast lookup (sum if multiple harvests same month)
  const harvestByMonth: Record<string, { kg: number; id: string }> = {};
  for (const h of harvests) {
    const [year, month] = h.harvestedAt.split('-').map(Number);
    const key = `${year}-${month}`;
    if (harvestByMonth[key]) {
      harvestByMonth[key] = { kg: harvestByMonth[key].kg + h.quantityKg, id: h.id };
    } else {
      harvestByMonth[key] = { kg: h.quantityKg, id: h.id };
    }
  }

  const data: MonthData[] = [];

  for (let offset = -5; offset <= 6; offset++) {
    let month = currentMonth + offset;
    let year = currentYear;
    if (month < 1) { month += 12; year -= 1; }
    if (month > 12) { month -= 12; year += 1; }

    const key = `${year}-${month}`;
    const harvest = harvestByMonth[key];
    let kg: number;
    let harvestId: string | null = null;
    let barType: BarType;

    if (harvest) {
      // Real logged harvest data
      kg = Math.round(harvest.kg * 10) / 10;
      harvestId = harvest.id;
      barType = offset === 0 ? 'current' : offset < 0 ? 'actual' : 'current';
    } else {
      // Model-based estimate/forecast
      kg = Math.round(activeHiveCount * avgYield * SEASONAL_FACTORS[month] * 10) / 10;
      barType = offset === 0 ? 'current' : offset > 0 ? 'forecast' : 'actual';
    }

    data.push({ month, year, label: MONTH_ABBR[month], kg, barType, harvestId });
  }
  return data;
}

function computeStats(data: MonthData[], harvests: HarvestRecord[]) {
  const currentYear = new Date().getFullYear();

  // Annual forecast = sum of all 12 months in chart for this year
  const annualForecast = data
    .filter((d) => d.year === currentYear)
    .reduce((sum, d) => sum + d.kg, 0);

  // Total logged this year
  const loggedKg = harvests
    .filter((h) => h.harvestedAt.startsWith(String(currentYear)))
    .reduce((sum, h) => sum + h.quantityKg, 0);

  // Peak month (highest forecast/actual)
  const peak = data.reduce((best, d) => (d.kg > best.kg ? d : best), data[0]);

  return {
    annualForecast: Math.round(annualForecast * 10) / 10,
    loggedKg: Math.round(loggedKg * 10) / 10,
    peakLabel: peak.kg > 0 ? MONTH_ABBR[peak.month] : '—',
  };
}

const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export function HoneyForecastChart({
  activeHiveCount,
  hives,
  harvests,
  subscriptionTier,
  onLogHarvest,
  onDeleteHarvest,
}: HoneyForecastChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 32, 380);
  const chartHeight = 180;
  const plotW = chartWidth - PAD_LEFT - PAD_RIGHT;
  const plotH = chartHeight - PAD_TOP - PAD_BOTTOM;

  const [selected, setSelected] = useState<MonthData | null>(null);
  const data = buildChartData(activeHiveCount, hives, harvests);
  const maxKg = Math.max(...data.map((d) => d.kg), 1);
  const yMax = Math.ceil(maxKg / 5) * 5 || 5;

  const barW = (plotW / data.length) * 0.6;
  const gap = plotW / data.length;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD_TOP + plotH * (1 - f),
    label: Math.round(yMax * f),
  }));

  const isPaidUser = subscriptionTier !== 'starter';
  const stats = isPaidUser ? computeStats(data, harvests) : null;

  const handleBarPress = (d: MonthData) => {
    setSelected((prev) => (prev?.month === d.month && prev?.year === d.year ? null : d));
  };

  const handleDeletePress = (harvestId: string) => {
    Alert.alert(
      'Slett høst?',
      'Denne høsteregistreringen vil bli slettet permanent.',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Slett', style: 'destructive', onPress: () => { onDeleteHarvest(harvestId); setSelected(null); } },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats row (paid only) */}
      {isPaidUser && stats ? (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.annualForecast} kg</Text>
            <Text style={styles.statLabel}>Årets prognose</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{stats.loggedKg} kg</Text>
            <Text style={styles.statLabel}>Logget høst</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.peakLabel}</Text>
            <Text style={styles.statLabel}>Toppmåned</Text>
          </View>
        </View>
      ) : (
        <Pressable style={styles.lockedStats} onPress={() => {}}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <View>
            <Text style={styles.lockedTitle}>Statistikk utilgjengelig</Text>
            <Text style={styles.lockedSub}>Oppgrader til Hobbyist for årsstatistikk og høstlogg</Text>
          </View>
        </Pressable>
      )}

      {/* Tooltip for selected bar */}
      {selected && (
        <View style={styles.tooltip}>
          <View>
            <Text style={styles.tooltipMonth}>
              {MONTH_ABBR[selected.month]} {selected.year}
              {selected.barType === 'forecast' ? '  (prognose)' : selected.harvestId ? '  (logget)' : '  (estimat)'}
            </Text>
            <Text style={styles.tooltipKg}>{selected.kg > 0 ? `${selected.kg} kg` : 'Ingen produksjon'}</Text>
          </View>
          {selected.harvestId && (
            <Pressable style={styles.deleteBtn} onPress={() => handleDeletePress(selected.harvestId!)}>
              <Text style={styles.deleteBtnText}>Slett</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* SVG Chart */}
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {gridLines.map((gl) => (
          <Line
            key={gl.label}
            x1={PAD_LEFT}
            y1={gl.y}
            x2={chartWidth - PAD_RIGHT}
            y2={gl.y}
            stroke={Colors.mid + '18'}
            strokeWidth={1}
          />
        ))}

        {/* Y-axis labels */}
        {gridLines.map((gl) =>
          gl.label > 0 ? (
            <SvgText
              key={`y-${gl.label}`}
              x={PAD_LEFT - 4}
              y={gl.y + 4}
              fontSize={8}
              fill={Colors.mid}
              textAnchor="end"
            >
              {gl.label}
            </SvgText>
          ) : null,
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = yMax > 0 ? (d.kg / yMax) * plotH : 0;
          const x = PAD_LEFT + gap * i + (gap - barW) / 2;
          const y = PAD_TOP + plotH - barH;
          const isSelected = selected?.month === d.month && selected?.year === d.year;

          const fill = d.barType === 'current'
            ? Colors.honeyDark
            : d.barType === 'forecast'
            ? Colors.honey + '70'
            : Colors.honey;

          return (
            <Rect
              key={`${d.year}-${d.month}`}
              x={x}
              y={barH > 0 ? y : PAD_TOP + plotH - 1}
              width={barW}
              height={barH > 0 ? barH : 1}
              rx={4}
              fill={fill}
              stroke={isSelected ? Colors.dark : d.barType === 'current' ? Colors.honeyDark : 'none'}
              strokeWidth={isSelected ? 2 : d.barType === 'current' ? 1.5 : 0}
              onPress={() => handleBarPress(d)}
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = PAD_LEFT + gap * i + gap / 2;
          return (
            <SvgText
              key={`x-${d.year}-${d.month}`}
              x={x}
              y={chartHeight - 6}
              fontSize={9}
              fill={d.barType === 'current' ? Colors.honeyDark : Colors.mid}
              textAnchor="middle"
              fontWeight={d.barType === 'current' ? 'bold' : 'normal'}
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend + Log button */}
      <View style={styles.footer}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.honeyDark }]} />
            <Text style={styles.legendText}>Historisk</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.honey, opacity: 0.5 }]} />
            <Text style={styles.legendText}>Prognose</Text>
          </View>
        </View>

        {isPaidUser ? (
          <Pressable
            style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.8 }]}
            onPress={onLogHarvest}
          >
            <Text style={styles.logBtnText}>+ Logg høst</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.disclaimer}>
        {activeHiveCount === 0
          ? 'Legg til kuber for å se prognose'
          : `~${Math.round(avgYieldForHives(hives))} kg/kube/år · Norsk sesongmodell · Trykk stang for detaljer`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.amber,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statCardMiddle: {
    backgroundColor: Colors.success + '15',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.dark },
  statLabel: { fontSize: 10, color: Colors.mid, marginTop: 2, textAlign: 'center' },
  lockedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  lockedIcon: { fontSize: 22 },
  lockedTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark },
  lockedSub: { fontSize: 11, color: Colors.mid, marginTop: 1 },
  tooltip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.amber,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tooltipMonth: { fontSize: 12, color: Colors.mid, marginBottom: 2 },
  tooltipKg: { fontSize: 16, fontWeight: '800', color: Colors.honeyDark },
  deleteBtn: {
    backgroundColor: Colors.error + '15',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '700', color: Colors.error },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.mid },
  logBtn: {
    backgroundColor: Colors.honey,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  logBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  disclaimer: { fontSize: 10, color: Colors.mid + '80', textAlign: 'center' },
});
