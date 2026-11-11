import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';

interface QueryErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

/**
 * Inline feilrad for seksjons-queries. Uten denne så en feilet henting ut som
 * «ingen data ennå» — den globale feiltoasten er borte etter tre sekunder,
 * mens tomtilstanden ble stående.
 */
export function QueryErrorNotice({ message, onRetry }: QueryErrorNoticeProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>⚠️ {message}</Text>
      <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" accessibilityLabel="Prøv igjen">
        <Text style={styles.retry}>Prøv igjen</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Shadows.card,
  },
  text: { fontSize: 13, color: Colors.mid, flex: 1 },
  retry: { fontSize: 13, color: Colors.honey, fontWeight: '700' },
});
