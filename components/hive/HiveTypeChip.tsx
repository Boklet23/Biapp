import { StyleSheet, Text, View } from 'react-native';
import { HiveType } from '@/types';

const LABELS: Record<HiveType, string> = {
  langstroth: 'Langstroth',
  warre: 'Warré',
  toppstang: 'Toppstang',
  annet: 'Annet',
};

const COLORS: Record<HiveType, { bg: string; text: string }> = {
  langstroth: { bg: '#FFF3DC', text: '#D4890A' },
  warre:      { bg: '#E8F8EF', text: '#27AE60' },
  toppstang:  { bg: '#EBF5FB', text: '#2980B9' },
  annet:      { bg: '#F2F3F4', text: '#7F8C8D' },
};

interface HiveTypeChipProps {
  type: HiveType;
  /** Vis hvit tekst på mørk halvgjennomsiktig bakgrunn (for bruk over foto) */
  light?: boolean;
}

export function HiveTypeChip({ type, light }: HiveTypeChipProps) {
  const { bg, text } = COLORS[type];
  return (
    <View style={[styles.chip, light ? styles.chipLight : { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: light ? '#FFFFFF' : text }]}>{LABELS[type]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  chipLight: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
