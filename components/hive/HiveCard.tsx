import { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Hive, Inspection, HiveWeight } from '@/types';
import { Colors, Radii, Shadows } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { HealthRing } from '@/components/ui/HealthRing';
import { computeHealthScore } from '@/utils/health';

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

function BoxStack({ count }: { count: number }) {
  const boxes = Math.min(Math.max(count, 1), 6);
  return (
    <View style={boxStyles.stack}>
      {Array.from({ length: boxes }).map((_, i) => (
        <View key={i} style={boxStyles.box} />
      ))}
    </View>
  );
}

const boxStyles = StyleSheet.create({
  stack: { gap: 2, alignItems: 'center' },
  box: { width: 20, height: 4, backgroundColor: Colors.honey, borderRadius: 1 },
});

interface HiveCardProps {
  hive: Hive;
  lastInspection?: Inspection;
  lastWeight?: HiveWeight;
  onPress: () => void;
}

export const HiveCard = memo(function HiveCard({ hive, lastInspection, lastWeight, onPress }: HiveCardProps) {
  const totalFrames =
    (lastInspection?.numFramesBrood ?? 0) +
    (lastInspection?.numFramesHoney ?? 0) +
    (lastInspection?.numFramesEmpty ?? 0);

  const healthScore = useMemo(() => computeHealthScore(lastInspection), [lastInspection]);
  const varroa = lastInspection?.varroaCount ?? null;
  const varroaBad = varroa != null && varroa > 3;
  const weightKg = lastWeight?.weightKg ?? null;
  const numBoxes = hive.numBoxes ?? 1;
  const varroaLabel = varroa == null ? null
    : varroa === 0 ? 'Ingen'
    : varroa <= 3 ? 'Lav'
    : varroa <= 5 ? 'Moderat'
    : varroa <= 10 ? 'Høy'
    : 'Kritisk';
  const varroaLabelColor = varroa == null || varroa <= 3 ? Colors.success
    : varroa <= 5 ? '#D4891A'
    : Colors.error;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Kube: ${hive.name}`}
    >
      {/* Top row: thumbnail · info · health ring */}
      <View style={styles.top}>
        <View style={styles.thumbnailWrap}>
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
          <View style={styles.boxBadge}>
            <BoxStack count={numBoxes} />
            <Text style={styles.boxCount}>{numBoxes}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{hive.name}</Text>
          {hive.beeBreed && (
            <Text style={styles.breed}>{BREED_LABELS[hive.beeBreed] ?? hive.beeBreed}</Text>
          )}
          <Text style={[
            styles.meta,
            lastInspection == null && styles.metaAlert,
          ]}>
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
          {varroaLabel != null && (
            <Text style={[styles.varroaLabel, { color: varroaLabelColor }]}>{varroaLabel}</Text>
          )}
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statKey}>RAMMER</Text>
          <Text style={styles.statVal}>{totalFrames > 0 ? totalFrames : '–'}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statKey}>ETASJER</Text>
          <Text style={styles.statVal}>{numBoxes}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.hair,
    overflow: 'hidden',
    ...Shadows.card,
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
  thumbnailWrap: {
    width: 76,
    height: 76,
    flexShrink: 0,
    position: 'relative',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailInitial: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
  boxBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 2,
  },
  boxCount: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.honeyDark,
    lineHeight: 10,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  breed: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.muted,
  },
  meta: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: Colors.honeyDark,
  },
  metaAlert: {
    color: Colors.error,
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
    fontFamily: FontFamily.semibold,
    lineHeight: 20,
    top: 16,
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 58,
  },

  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.hair,
    backgroundColor: Colors.light,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.hair,
  },
  statKey: {
    fontSize: 8,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    letterSpacing: 0.8,
    color: Colors.muted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.ink,
  },
  statValBad: {
    color: Colors.error,
  },
  varroaLabel: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
