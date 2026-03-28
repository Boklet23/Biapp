import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blur?: boolean;
}

export function Card({ children, style, blur = false }: CardProps) {
  if (blur) {
    return (
      <BlurView intensity={60} tint="light" style={[styles.base, style]}>
        {children}
      </BlurView>
    );
  }

  return <View style={[styles.base, styles.solid, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  solid: {
    backgroundColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
