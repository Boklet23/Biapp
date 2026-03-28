import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  dark?: boolean;
}

export function Screen({ children, style, dark = false }: ScreenProps) {
  return (
    <SafeAreaView
      style={[styles.container, dark && styles.dark, style]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  dark: {
    backgroundColor: Colors.dark,
  },
  content: {
    flex: 1,
  },
});
