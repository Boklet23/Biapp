import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const SEASONAL_FACTORS: Record<number, number> = {
  1: 0.00, 2: 0.00, 3: 0.00, 4: 0.01,
  5: 0.05, 6: 0.12, 7: 0.30, 8: 0.35,
  9: 0.12, 10: 0.05, 11: 0.00, 12: 0.00,
};
const AVG_KG_PER_HIVE_PER_YEAR = 20;

interface HoneyWidgetProps {
  activeHiveCount: number;
  harvestedKgThisYear: number;
}

function annualForecast(activeHiveCount: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let total = 0;
  for (let m = 1; m <= 12; m++) {
    total += activeHiveCount * AVG_KG_PER_HIVE_PER_YEAR * SEASONAL_FACTORS[m];
  }
  return Math.round(total * 10) / 10;
}

interface StatProps {
  label: string;
  value: string;
  accent?: boolean;
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: Colors.success }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function HoneyWidget({ activeHiveCount, harvestedKgThisYear }: HoneyWidgetProps) {
  const forecast = annualForecast(activeHiveCount);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={() => router.push('/(app)/(tabs)/laer' as any)}
      accessibilityRole="button"
      accessibilityLabel="Åpne honningprognose"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Honning</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
      <View style={styles.row}>
        <Stat label="Aktive kuber" value={String(activeHiveCount)} />
        <View style={styles.divider} />
        <Stat label="Logget i år" value={`${harvestedKgThisYear} kg`} accent />
        <View style={styles.divider} />
        <Stat label="Årets estimat" value={`${forecast} kg`} />
      </View>
    </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: Colors.honeyDark },
  arrow: { fontSize: 18, color: Colors.mid },
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
