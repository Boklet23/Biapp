import { Text as SvgText, Circle, Svg } from 'react-native-svg';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface HealthRingProps {
  score: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.honey;
  if (score >= 40) return Colors.sevHigh;
  return Colors.error;
}

export function HealthRing({ score, size = 120, stroke = 10, showLabel = true }: HealthRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (clamped / 100);
  const color = scoreColor(clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={Colors.hair}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </Svg>
      {showLabel && (
        <View style={[StyleSheet.absoluteFill, styles.label]}>
          <Text style={[styles.score, { color: Colors.ink }]}>{clamped}</Text>
          <Text style={styles.sub}>Helse</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
  sub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
