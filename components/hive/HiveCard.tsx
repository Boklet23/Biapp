import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Hive, Inspection } from '@/types';
import { Colors, Shadows } from '@/constants/colors';
import { HiveTypeChip } from './HiveTypeChip';

function daysSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'i dag';
  if (days === 1) return 'i går';
  return `${days} dager siden`;
}

interface HiveCardProps {
  hive: Hive;
  lastInspection?: Inspection;
  onPress: () => void;
}

export function HiveCard({ hive, lastInspection, onPress }: HiveCardProps) {
  const totalFrames =
    (lastInspection?.numFramesBrood ?? 0) +
    (lastInspection?.numFramesHoney ?? 0) +
    (lastInspection?.numFramesEmpty ?? 0);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Kube: ${hive.name}`}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{hive.name}</Text>
        <HiveTypeChip type={hive.type} />
      </View>

      {hive.locationName ? (
        <Text style={styles.location}>📍 {hive.locationName}</Text>
      ) : null}

      <View style={styles.footer}>
        {lastInspection ? (
          <>
            <Text style={styles.meta}>
              Sist inspisert: {daysSince(lastInspection.inspectedAt)}
            </Text>
            {totalFrames > 0 && (
              <Text style={styles.meta}>{totalFrames} rammer</Text>
            )}
          </>
        ) : (
          <Text style={styles.noInspection}>Ikke inspisert ennå</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontSize: 13,
    color: Colors.mid,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    color: Colors.mid,
  },
  noInspection: {
    fontSize: 13,
    color: Colors.warning,
    fontStyle: 'italic',
  },
});
