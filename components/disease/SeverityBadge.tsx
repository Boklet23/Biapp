import { StyleSheet, Text, View } from 'react-native';
import { DiseaseSeverity } from '@/types';

interface SeverityBadgeProps {
  severity: DiseaseSeverity;
  notifiable?: boolean;
}

const SEVERITY_CONFIG: Record<DiseaseSeverity, { label: string; bg: string; text: string }> = {
  lav: { label: 'Lav risiko', bg: '#D5F5E3', text: '#1E8449' },
  moderat: { label: 'Moderat', bg: '#FEF9E7', text: '#B7950B' },
  alvorlig: { label: 'Alvorlig', bg: '#FDEDEC', text: '#CB4335' },
  kritisk: { label: 'Kritisk', bg: '#FADBD8', text: '#922B21' },
};

export function SeverityBadge({ severity, notifiable }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
      </View>
      {notifiable && (
        <View style={styles.notifiableBadge}>
          <Text style={styles.notifiableText}>⚠️ Meldepliktig</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
  notifiableBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FADBD8',
    alignSelf: 'flex-start',
  },
  notifiableText: { fontSize: 12, fontWeight: '700', color: '#922B21' },
});
