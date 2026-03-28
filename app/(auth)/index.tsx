import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🐝',
    title: 'Birøkt gjort enkelt',
    description:
      'BiApp hjelper deg med å holde oversikt over kubene dine, gjøre inspeksjoner og lære om bienes verden.',
  },
  {
    id: '2',
    emoji: '📋',
    title: 'Hold orden på kubene',
    description:
      'Registrer inspeksjoner, overvåk varroatall og følg med på kubenes helse gjennom hele sesongen.',
  },
  {
    id: '3',
    emoji: '📖',
    title: 'Fra nybegynner til proff',
    description:
      'Sykdomsguide, sesongkalender og nybegynnerartikler — alt du trenger for å lykkes med birøkt.',
  },
];

export default function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push('/(auth)/register');
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dot indicator */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          onPress={handleNext}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>
            {isLast ? 'Kom i gang' : 'Neste'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.ghostBtn, pressed && styles.ghostBtnPressed]}
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="button"
        >
          <Text style={styles.ghostBtnText}>Har allerede konto? Logg inn</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emoji: { fontSize: 80 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: Colors.white + 'AA',
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white + '30',
  },
  dotActive: {
    backgroundColor: Colors.honey,
    width: 24,
  },
  buttons: {
    width: '100%',
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnPressed: { opacity: 0.85 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  ghostBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnPressed: { opacity: 0.6 },
  ghostBtnText: { fontSize: 14, color: Colors.white + '70', fontWeight: '500' },
});
