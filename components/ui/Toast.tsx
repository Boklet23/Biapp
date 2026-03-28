import { useEffect } from 'react';
import { Animated, StyleSheet, Text, useAnimatedValue } from 'react-native';
import { Colors } from '@/constants/colors';
import { useToastStore } from '@/store/toast';

const TYPE_CONFIG = {
  error:   { bg: '#C0392B', icon: '⚠️' },
  success: { bg: Colors.success, icon: '✓' },
  info:    { bg: Colors.info, icon: 'ℹ️' },
} as const;

export function GlobalToast() {
  const { message, type, hide } = useToastStore();
  const opacity = useAnimatedValue(0);

  useEffect(() => {
    if (!message) return;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => hide());
  }, [message]);

  if (!message) return null;

  const config = TYPE_CONFIG[type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: config.bg, opacity }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  icon: { fontSize: 18 },
  text: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.white, lineHeight: 20 },
});
