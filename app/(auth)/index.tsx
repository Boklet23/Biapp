import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HiveScene } from '@/components/animations/HiveScene';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { ONBOARDING_KEY } from './onboarding';

// Pre-auth entry gate: shows the brand splash briefly, then routes
// first-time visitors through the value-prop onboarding and returning
// visitors straight to the welcome/sign-in screen.
async function resolveEntry() {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY).catch(() => null);
  router.replace((done ? '/(auth)/welcome' : '/(auth)/onboarding') as any);
}

export default function AuthEntry() {
  useEffect(() => {
    const timer = setTimeout(resolveEntry, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.container} onPress={resolveEntry}>
      <View style={styles.sceneWrapper}>
        <HiveScene scene="exterior" height={260} />
      </View>
      <Text style={styles.appName}>BiVokter</Text>
      <Text style={styles.tagline}>Din birøkterapp</Text>
      <Text style={styles.hint}>Trykk for å fortsette</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sceneWrapper: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.dark,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Colors.mid,
    fontWeight: '500',
    fontFamily: FontFamily.medium,
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    fontSize: 13,
    color: Colors.mid,
    opacity: 0.6,
    fontFamily: FontFamily.regular,
  },
});
