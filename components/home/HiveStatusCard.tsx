import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Hive, Inspection } from '@/types';

const MOOD_EMOJI = ['', '😟', '😐', '😊', '😁', '🤩'];

interface HiveStatusCardProps {
  hive: Hive;
  lastInspection: Inspection | undefined;
  onPress: () => void;
}

function daysSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'i dag';
  if (days === 1) return 'i går';
  if (days < 7) return `${days} dager siden`;
  if (days < 30) return `${Math.floor(days / 7)} uker siden`;
  return `${Math.floor(days / 30)} mnd siden`;
}

export function HiveStatusCard({ hive, lastInspection, onPress }: HiveStatusCardProps) {
  const hasInspection = !!lastInspection;
  const daysAgo = hasInspection ? daysSince(lastInspection.inspectedAt) : null;
  const isOverdue = hasInspection
    ? Date.now() - new Date(lastInspection.inspectedAt).getTime() > 14 * 86400000
    : true;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hive.name}, ${daysAgo ?? 'ikke inspisert'}`}
    >
      <Text style={styles.name} numberOfLines={1}>{hive.name}</Text>

      {hasInspection ? (
        <>
          <Text style={[styles.days, isOverdue && styles.daysOverdue]}>{daysAgo}</Text>
          {lastInspection.moodScore != null && (
            <Text style={styles.mood}>{MOOD_EMOJI[lastInspection.moodScore]}</Text>
          )}
        </>
      ) : (
        <Text style={[styles.days, styles.daysOverdue]}>Ikke inspisert</Text>
      )}

      {isOverdue && <View style={styles.overdueDot} />}
    </Pressable>
  );
}

// Legg-til-kube knapp
export function AddHiveCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.addCard, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Legg til ny kube"
    >
      <Text style={styles.addIcon}>＋</Text>
      <Text style={styles.addLabel}>Ny kube</Text>
    </Pressable>
  );
}

const CARD_W = 130;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
    position: 'relative',
  },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  name: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  days: { fontSize: 12, color: Colors.mid },
  daysOverdue: { color: Colors.warning, fontWeight: '600' },
  mood: { fontSize: 20, marginTop: 4 },
  overdueDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  addCard: {
    borderWidth: 1.5,
    borderColor: Colors.mid + '25',
    borderStyle: 'dashed',
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0,
    elevation: 0,
  },
  addIcon: { fontSize: 28, color: Colors.honey, fontWeight: '300' },
  addLabel: { fontSize: 12, color: Colors.mid, fontWeight: '600' },
});
