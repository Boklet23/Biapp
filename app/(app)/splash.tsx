import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { HiveScene } from '@/components/animations/HiveScene';
import { Colors } from '@/constants/colors';
import { ONBOARDING_KEY } from './onboarding';

async function goToApp() {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY).catch(() => null);
  if (!done) {
    router.replace('/(app)/onboarding' as any);
  } else {
    router.replace('/(app)/(tabs)/hjem' as any);
  }
}

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(goToApp, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.container} onPress={goToApp}>
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
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Colors.mid,
    fontWeight: '500',
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    fontSize: 13,
    color: Colors.mid,
    opacity: 0.6,
  },
});
