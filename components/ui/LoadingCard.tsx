import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';

interface LoadingCardProps {
  size?: 'small' | 'large';
}

export function LoadingCard({ size = 'large' }: LoadingCardProps) {
  return (
    <View style={styles.card}>
      <ActivityIndicator size={size} color={Colors.honey} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
});
