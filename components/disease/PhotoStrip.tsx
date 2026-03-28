import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { DiseasePhoto } from '@/types';

interface PhotoStripProps {
  photos: DiseasePhoto[];
}

export function PhotoStrip({ photos }: PhotoStripProps) {
  if (photos.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Bilder</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {photos.map((photo, i) => (
          <View key={i} style={[styles.card, { backgroundColor: photo.bg }]}>
            <View style={styles.imageArea}>
              {photo.uri ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.emoji}>{photo.emoji}</Text>
              )}
            </View>
            <Text style={styles.caption} numberOfLines={2}>{photo.caption}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_W = 160;
const IMAGE_H = 116;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  strip: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: CARD_W,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageArea: {
    width: CARD_W,
    height: IMAGE_H,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: CARD_W,
    height: IMAGE_H,
  },
  emoji: {
    fontSize: 52,
  },
  caption: {
    fontSize: 12,
    color: Colors.dark,
    lineHeight: 17,
    padding: 10,
    paddingTop: 7,
    fontWeight: '500',
    backgroundColor: Colors.white,
  },
});
