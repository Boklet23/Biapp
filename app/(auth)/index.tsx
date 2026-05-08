import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AMBER = '#F5A623';
const AMBER_DARK = '#291800';

interface BeeProps { top: number | `${number}%`; left: number | `${number}%`; delayMs: number; scale?: number; }

function Bee({ top, left, delayMs, scale = 1 }: BeeProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    tx.value = withDelay(delayMs, withRepeat(
      withSequence(
        withTiming(40, { duration: 3200 }),
        withTiming(-22, { duration: 2600 }),
        withTiming(12, { duration: 2100 }),
        withTiming(0, { duration: 2500 }),
      ), -1, false,
    ));
    ty.value = withDelay(delayMs, withRepeat(
      withSequence(
        withTiming(-30, { duration: 2900 }),
        withTiming(18, { duration: 2300 }),
        withTiming(-8, { duration: 2400 }),
        withTiming(0, { duration: 2600 }),
      ), -1, false,
    ));
  }, [delayMs]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale }],
  }));

  return <Animated.View style={[styles.bee, { top, left }, animStyle]} />;
}

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Background gradient — dark landscape feel */}
      <LinearGradient
        colors={['#0F1B09', '#1a1400', '#060810']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow top-right */}
      <View style={styles.glowTopRight} />
      {/* Ambient glow bottom-left */}
      <View style={styles.glowBottomLeft} />

      {/* Animated bees */}
      <Bee top="18%" left="72%" delayMs={0} />
      <Bee top="42%" left="12%" delayMs={2000} scale={0.8} />
      <Bee top="68%" left="80%" delayMs={5000} scale={0.7} />
      <Bee top="78%" left="28%" delayMs={1200} scale={0.6} />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 16 }]}>

        {/* Brand section */}
        <View style={styles.brandSection}>
          <View style={styles.logoCard}>
            <Text style={styles.logoIcon}>🐝</Text>
          </View>
          <Text style={styles.appName}>BiVokter</Text>
          <Text style={styles.tagline}>Bærekraftig birøkt for en gyllen fremtid.</Text>
        </View>

        {/* Feature teaser card */}
        <BlurView intensity={18} tint="dark" style={styles.featureCard}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIconText}>🌿</Text>
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Naturens intelligens</Text>
            <Text style={styles.featureBody}>
              Overvåk dine kuber med presisjon og omsorg direkte fra mobilen.
            </Text>
          </View>
        </BlurView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Kom i gang</Text>
            <Text style={styles.primaryBtnArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>
              Har du allerede en konto?{' '}
              <Text style={styles.secondaryBtnHighlight}>Logg inn</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  glowTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: AMBER,
    opacity: 0.07,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: '-5%',
    left: '-5%',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#835500',
    opacity: 0.12,
  },

  bee: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  brandSection: {
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: AMBER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 4,
  },
  logoIcon: { fontSize: 40 },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    fontFamily: 'Manrope_800ExtraBold',
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
    fontFamily: 'Manrope_400Regular',
  },

  featureCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    marginVertical: 8,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(245,166,35,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: { fontSize: 24 },
  featureTextWrap: { flex: 1, gap: 4 },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Manrope_700Bold',
  },
  featureBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
    fontFamily: 'Manrope_400Regular',
  },

  actions: { gap: 12, paddingBottom: 8 },

  primaryBtn: {
    height: 54,
    backgroundColor: AMBER,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: AMBER_DARK,
    fontFamily: 'Manrope_700Bold',
  },
  primaryBtnArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: AMBER_DARK,
  },

  secondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Manrope_400Regular',
  },
  secondaryBtnHighlight: {
    color: AMBER,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
});
