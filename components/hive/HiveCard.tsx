import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
      {/* Topp: bilde med navn-overlay ELLER enkel header */}
      {hive.photoUrl ? (
        <View style={styles.photoWrapper}>
          <Image
            source={{ uri: hive.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel={`Bilde av ${hive.name}`}
          />
          {/* Mørk gradient-overlay nederst i bildet */}
          <View style={styles.photoOverlay} />
          <View style={styles.photoMeta}>
            <Text style={styles.photoName} numberOfLines={1}>{hive.name}</Text>
            <HiveTypeChip type={hive.type} light />
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{hive.name}</Text>
          <HiveTypeChip type={hive.type} />
        </View>
      )}

      {/* Bunninformasjon */}
      <View style={styles.body}>
        {hive.locationName ? (
          <Text style={styles.location}>📍 {hive.locationName}</Text>
        ) : null}

        <View style={styles.footer}>
          {lastInspection ? (
            <>
              <Text style={styles.meta}>
                Inspisert {daysSince(lastInspection.inspectedAt)}
              </Text>
              {totalFrames > 0 && (
                <Text style={styles.meta}>{totalFrames} rammer</Text>
              )}
            </>
          ) : (
            <Text style={styles.noInspection}>Ikke inspisert ennå</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  /* Med bilde */
  photoWrapper: {
    position: 'relative',
    height: 140,
  },
  photo: {
    width: '100%',
    height: 140,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  photoMeta: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  photoName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Uten bilde */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
  },

  /* Felles bunn */
  body: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  location: {
    fontSize: 13,
    color: Colors.mid,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
