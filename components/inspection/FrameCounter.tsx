import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface FrameCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function FrameCounter({ label, value, onChange, min = 0, max = 99 }: FrameCounterProps) {
  const decrement = () => { if (value > min) onChange(value - 1); };
  const increment = () => { if (value < max) onChange(value + 1); };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed, value <= min && styles.disabled]}
          onPress={decrement}
          disabled={value <= min}
          accessibilityLabel={`Reduser ${label}`}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed, value >= max && styles.disabled]}
          onPress={increment}
          disabled={value >= max}
          accessibilityLabel={`Øk ${label}`}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  label: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '500',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.honeyDark,
    lineHeight: 24,
  },
  valueBox: {
    width: 44,
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
  },
});
