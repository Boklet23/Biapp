import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { SEASON_GUIDE } from '@/constants/seasonGuide';

interface SeasonGuideProps {
  month: number; // 1–12
}

export function SeasonGuide({ month }: SeasonGuideProps) {
  const guide = SEASON_GUIDE.find((g) => g.month === month);
  if (!guide) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{guide.icon}</Text>
        <View>
          <Text style={styles.title}>Sesongguide – {guide.title}</Text>
          <Text style={styles.description}>{guide.description}</Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {guide.tasks.map((task, i) => (
          <View key={i} style={styles.taskRow}>
            <Text style={styles.taskBullet}>🐝</Text>
            <Text style={styles.taskText}>{task}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.amber,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  icon: { fontSize: 32 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  description: { fontSize: 13, color: Colors.mid, lineHeight: 18 },
  taskList: { gap: 8 },
  taskRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  taskBullet: { fontSize: 14, marginTop: 1 },
  taskText: { flex: 1, fontSize: 14, color: Colors.dark, lineHeight: 20 },
});
