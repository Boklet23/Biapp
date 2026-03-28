import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ikke funnet' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🐝</Text>
        <Text style={styles.title}>Siden finnes ikke</Text>
        <Link href="/" style={styles.link}>
          Gå hjem
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light,
    gap: 16,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  link: { color: Colors.honey, fontSize: 16, fontWeight: '600' },
});
