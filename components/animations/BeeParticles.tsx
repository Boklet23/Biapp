import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface Particle {
  x: number;      // % fra venstre (0–100)
  size: number;   // font-størrelse
  duration: number;
  delay: number;
}

const PARTICLES: Particle[] = [
  { x: 6,  size: 13, duration: 4200, delay: 0    },
  { x: 21, size: 10, duration: 5600, delay: 900  },
  { x: 38, size: 15, duration: 3800, delay: 1700 },
  { x: 55, size: 11, duration: 4900, delay: 400  },
  { x: 72, size: 14, duration: 4400, delay: 1300 },
  { x: 88, size: 10, duration: 5100, delay: 2100 },
];

function ParticleView({ p, height }: { p: Particle; height: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: p.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) run();
      });
    };

    timer = setTimeout(run, p.delay);
    return () => clearTimeout(timer);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.75, 0.5, 0] });

  return (
    <Animated.View
      style={[styles.particle, { left: `${p.x}%`, bottom: 0, transform: [{ translateY }], opacity }]}
    >
      <Text style={{ fontSize: p.size }}>🐝</Text>
    </Animated.View>
  );
}

interface BeeParticlesProps {
  height?: number;
}

export function BeeParticles({ height = 110 }: BeeParticlesProps) {
  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      {PARTICLES.map((p, i) => (
        <ParticleView key={i} p={p} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
});
