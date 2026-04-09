import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '@/constants/colors';
import { SEASON_CHECKLISTS } from '@/constants/seasonChecklist';

const storageKey = (month: number, year: number, id: string) =>
  `checklist_${year}_${month}_${id}`;

interface SeasonChecklistProps {
  month: number;
  year: number;
}

export function SeasonChecklist({ month, year }: SeasonChecklistProps) {
  const checklist = SEASON_CHECKLISTS.find((c) => c.month === month);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = useCallback(async (id: string) => {
    const key = storageKey(month, year, id);
    const next = !checked[id];
    setChecked((prev) => ({ ...prev, [id]: next }));
    if (next) {
      await AsyncStorage.setItem(key, '1').catch(() => null);
    } else {
      await AsyncStorage.removeItem(key).catch(() => null);
    }
  }, [checked, month, year]);

  if (!checklist) return null;

  const total = checklist.items.length;
  const done = checklist.items.filter((i) => checked[i.id]).length;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{checklist.icon} Sjekkliste — {checklist.title}</Text>
        <Text style={styles.progress}>{done}/{total}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${total > 0 ? (done / total) * 100 : 0}%` }]} />
      </View>
      <View style={styles.list}>
        {checklist.items.map((item, i) => {
          const isDone = checked[item.id] ?? false;
          return (
            <Pressable
              key={item.id}
              style={[styles.row, i < checklist.items.length - 1 && styles.rowBorder]}
              onPress={() => toggle(item.id)}
            >
              <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                {isDone && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.task, isDone && styles.taskDone]}>{item.task}</Text>
                {item.detail && <Text style={styles.detail}>{item.detail}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      {done === total && total > 0 && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeText}>🎉 Alle oppgaver for {checklist.title} er fullført!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  progress: { fontSize: 13, fontWeight: '700', color: Colors.honey },
  progressBar: { height: 6, backgroundColor: Colors.mid + '20', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.honey, borderRadius: 3 },
  list: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', ...Shadows.card },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '12' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: Colors.mid + '50', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxDone: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  checkmark: { fontSize: 13, color: Colors.white, fontWeight: '800' },
  rowText: { flex: 1, gap: 2 },
  task: { fontSize: 14, color: Colors.dark, fontWeight: '500' },
  taskDone: { textDecorationLine: 'line-through', color: Colors.mid },
  detail: { fontSize: 12, color: Colors.mid },
  completeBanner: { backgroundColor: Colors.success + '18', borderRadius: 12, padding: 14, alignItems: 'center' },
  completeText: { fontSize: 13, fontWeight: '600', color: Colors.success },
});
