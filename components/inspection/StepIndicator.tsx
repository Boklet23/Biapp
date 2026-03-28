import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface StepIndicatorProps {
  current: number;
  total: number;
  labels?: string[];
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.circle, done && styles.done, active && styles.active]}>
              {done ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.number, active && styles.activeNumber]}>{step}</Text>
              )}
            </View>
            {labels && (
              <Text style={[styles.label, active && styles.activeLabel]}>
                {labels[i]}
              </Text>
            )}
            {step < total && <View style={[styles.line, done && styles.lineDone]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light,
    borderWidth: 2,
    borderColor: Colors.mid + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honey,
  },
  done: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  number: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mid,
  },
  activeNumber: {
    color: Colors.white,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  label: {
    fontSize: 11,
    color: Colors.mid,
    marginLeft: 4,
    marginRight: 4,
  },
  activeLabel: {
    color: Colors.honey,
    fontWeight: '600',
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: Colors.mid + '30',
    marginHorizontal: 2,
  },
  lineDone: {
    backgroundColor: Colors.success,
  },
});
