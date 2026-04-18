import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Hive, Inspection, HiveWeight } from '@/types';
import { Colors } from '@/constants/colors';
import { HealthRing } from '@/components/ui/HealthRing';

const BREED_LABELS: Record<string, string> = {
  norsk_landbee: 'Norsk landbee',
  buckfast: 'Buckfast',
  carniolan: 'Carnica',
  annet: 'Annet',
};

const TYPE_COLORS: Record<string, string> = {
  langstroth: Colors.honey,
  warre: Colors.success,
  toppstang: Colors.info,
  annet: Colors.muted,
};

function daysSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'i dag';
  if (days === 1) return 'i går';
  return `${days} d siden`;
}

function computeHealthScore(insp: Inspection | undefined): number {
  if (!insp) return 50;
  const varroa = insp.varroaCount ?? 0;
  if (varroa === 0) return 95;
  if (varroa <= 1) return 88;
  if (varroa <= 2) return 78;
  if (varroa <= 3) return 65;
  if (varroa <= 5) return 48;
  return 32;
}

interface HiveCardProps {
  hive: Hive;
  lastInspection?: Inspection;
  lastWeight?: HiveWeight;
  onPress: () => void;
}

export function HiveCard({ hive, lastInspection, lastWeight, onPress }: HiveCardProps) {
  const totalFrames =
    (lastInspection?.numFramesBrood ?? 0) +
    (lastInspection?.numFramesHoney ?? 0) +
    (lastInspection?.numFramesEmpty ?? 0);

  const healthScore = computeHealthScore(lastInspection);
  const varroa = lastInspection?.varroaCount;
  const varroaBad = varroa != null && varroa > 3;
  const weightKg = lastWeight?.weightKg ?? null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Kube: ${hive.name}`}
    >
      {/* Top row: thumbnail · info · health ring */}
      <View style={styles.top}>
        {hive.photoUrl ? (
          <Image
            source={{ uri: hive.photoUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityLabel={`Bilde av ${hive.name}`}
          />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: TYPE_COLORS[hive.type] ?? Colors.muted }]}>
            <Text style={styles.thumbnailInitial}>{hive.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{hive.name}</Text>
          {hive.beeBreed && (
            <Text style={styles.breed}>{BREED_LABELS[hive.beeBreed] ?? hive.beeBreed}</Text>
          )}
          <Text style={styles.meta}>
            {lastInspection
              ? `Sjekket ${daysSince(lastInspection.inspectedAt)}`
              : 'Ikke inspisert'}
          </Text>
        </View>

        <View style={styles.ringWrapper}>
          <HealthRing score={healthScore} size={58} stroke={5} showLabel={false} />
          <Text style={[styles.ringScore, { color: Colors.ink }]}>{healthScore}</Text>
          <Text style={styles.ringLabel}>HELSE</Text>
        </View>
      </View>

      {/* Bottom stats strip */}
      <View style={styles.stats}>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statKey}>VEKT</Text>
          <Text style={styles.statVal}>
            {weightKg != null ? `${weightKg} kg` : '–'}
          </Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statKey}>VARROA</Text>
          <Text style={[styles.statVal, varroaBad && styles.statValBad]}>
            {varroa != null ? varroa : '–'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statKey}>RAMMER</Text>
          <Text style={styles.statVal}>{totalFrames > 0 ? totalFrames : '–'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.hair,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  top: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 12,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  breed: {
    fontSize: 12,
    color: Colors.muted,
  },
  meta: {
    fontSize: 12,
    color: Colors.muted,
  },

  ringWrapper: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  ringScore: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
    top: 16,
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 58,
  },

  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.hair,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.hair,
  },
  statKey: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.muted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  statValBad: {
    color: Colors.error,
  },
});
