import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export const ONBOARDING_KEY = 'bivokter_onboarding_done';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🐝',
    title: 'Velkommen til BiVokter',
    body: 'Den norske birøkterappen som hjelper deg holde orden på kuber, inspeksjoner og behandlinger — alt på ett sted.',
  },
  {
    id: '2',
    emoji: '📋',
    title: 'Logg alt på sekunder',
    body: 'Registrer inspeksjoner, varroa-tellinger, behandlinger og høsting direkte fra telefonen — ute i feltet uten nett.',
  },
  {
    id: '3',
    emoji: '🤖',
    title: 'AI teller varroa for deg',
    body: 'Ta et bilde av klisterplaten — BiVokter teller mitter automatisk og gir behandlingsanbefaling på sekunder.',
  },
  {
    id: '4',
    emoji: '📊',
    title: 'Følg med på helsen',
    body: 'Varroa-trender, smarte push-varsler og inspeksjonsplanlegger — appen gir deg beskjed når en kube trenger oppmerksomhet.',
  },
  {
    id: '5',
    emoji: '📄',
    title: 'Dokumentasjon på knappen',
    body: 'Generer årsrapport med inspeksjoner og behandlingslogg med ett trykk — oppfyller kravene til Mattilsynet.',
  },
] as const;

interface SlideProps {
  emoji: string;
  title: string;
  body: string;
}

function Slide({ emoji, title, body }: SlideProps) {
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Text style={styles.slideEmoji}>{emoji}</Text>
      <Text style={styles.slideTitle}>{title}</Text>
      <Text style={styles.slideBody}>{body}</Text>
    </View>
  );
}

async function finishOnboarding(destination: string) {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  router.replace(destination as any);
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) return;
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Slide {...item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      {isLast ? (
        <View style={styles.ctaBox}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            onPress={() => finishOnboarding('/(auth)/register')}
          >
            <Text style={styles.primaryBtnText}>Kom i gang →</Text>
          </Pressable>
          <Text style={styles.trialNote}>
            ✓ Få 14 dager gratis Hobbyist når du registrerer deg — prøv AI-varroaanalyse
          </Text>
          <Pressable
            onPress={() => { void finishOnboarding('/(auth)/login'); }}
            hitSlop={12}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>
              Har du allerede konto? <Text style={styles.skipLink}>Logg inn</Text>
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.ctaBox}>
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.8 }]}
            onPress={goNext}
          >
            <Text style={styles.nextBtnText}>Neste →</Text>
          </Pressable>
          <Pressable
            onPress={() => { void finishOnboarding('/(auth)/register'); }}
            hitSlop={12}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Hopp over</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  slideEmoji: { fontSize: 80 },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.dark,
    textAlign: 'center',
    lineHeight: 32,
  },
  slideBody: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
    textAlign: 'center',
    lineHeight: 24,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mid + '40' },
  dotActive: { backgroundColor: Colors.honey, width: 20 },

  ctaBox: { paddingHorizontal: 24, paddingBottom: 48, gap: 12, alignItems: 'center' },

  primaryBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', fontFamily: FontFamily.extrabold, color: Colors.dark },
  trialNote: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  nextBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.white },

  skipBtn: { paddingVertical: 4 },
  skipText: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.mid },
  skipLink: { color: Colors.honeyDark, fontFamily: FontFamily.bold, fontWeight: '700' },
});
