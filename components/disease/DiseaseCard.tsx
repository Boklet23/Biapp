import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SeverityBadge } from './SeverityBadge';
import { Colors } from '@/constants/colors';
import { Disease } from '@/types';

interface DiseaseCardProps {
  disease: Disease;
  onPress: () => void;
}

export function DiseaseCard({ disease, onPress }: DiseaseCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={disease.nameNo}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.name}>{disease.nameNo}</Text>
          <SeverityBadge severity={disease.severity} notifiable={disease.isNotifiable} />
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  content: { flex: 1, gap: 6 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  chevron: { fontSize: 22, color: Colors.mid, fontWeight: '300' },
});
