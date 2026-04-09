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
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';

export const ONBOARDING_KEY = 'bivokter_onboarding_done';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isExpoGo = Constants.appOwnership === 'expo';

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
    emoji: '📊',
    title: 'Følg med på helsen',
    body: 'Varroa-trender, svermvarsler, kubevekt og inspeksjonsplanlegger basert på været — all info du trenger for sunne bier.',
  },
  {
    id: '4',
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

async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  router.replace('/(app)/(tabs)/hjem' as any);
}

async function startTrial() {
  if (isExpoGo) {
    await completeOnboarding();
    return;
  }
  try {
    const { fetchOfferings, purchasePackage } = await import('@/services/subscription');
    const packages = await fetchOfferings();
    const hobbyist = packages.find((p) => p.identifier === 'hobbyist_monthly');
    if (hobbyist) {
      await purchasePackage(hobbyist);
    }
  } catch {
    // User cancelled or error — proceed anyway
  }
  await completeOnboarding();
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
            style={({ pressed }) => [styles.trialBtn, pressed && { opacity: 0.85 }]}
            onPress={startTrial}
          >
            <Text style={styles.trialBtnText}>Start 14 dager gratis Hobbyist</Text>
            <Text style={styles.trialBtnSub}>Deretter 49 kr/mnd · Avbryt når som helst</Text>
          </Pressable>
          <Pressable onPress={completeOnboarding} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipText}>Fortsett med Starter (gratis, 3 kuber)</Text>
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
          <Pressable onPress={completeOnboarding} hitSlop={12} style={styles.skipBtn}>
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
  slideTitle: { fontSize: 26, fontWeight: '800', color: Colors.dark, textAlign: 'center', lineHeight: 32 },
  slideBody: { fontSize: 16, color: Colors.mid, textAlign: 'center', lineHeight: 24 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mid + '40' },
  dotActive: { backgroundColor: Colors.honey, width: 20 },

  ctaBox: { paddingHorizontal: 24, paddingBottom: 48, gap: 12, alignItems: 'center' },

  trialBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    gap: 4,
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  trialBtnText: { fontSize: 17, fontWeight: '800', color: Colors.white },
  trialBtnSub: { fontSize: 12, color: Colors.white, opacity: 0.8 },

  nextBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: Colors.white },

  skipBtn: { paddingVertical: 4 },
  skipText: { fontSize: 13, color: Colors.mid },
});
