import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { MOOD_EMOJIS } from '@/constants/ui';
import { sharedStyles } from './inspectionStyles';

export interface Step4Props {
  notes: string;
  setNotes: (v: string) => void;
  moodScore: number;
  setMoodScore: (v: number) => void;
  photoUris: string[];
  onAddPhoto: () => Promise<void>;
  onRemovePhoto: (uri: string) => void;
}

export function Step4({ notes, setNotes, moodScore, setMoodScore, photoUris, onAddPhoto, onRemovePhoto }: Step4Props) {
  return (
    <View style={sharedStyles.stepContent}>
      <Text style={sharedStyles.stepHeading}>Notater og humør</Text>

      <View style={sharedStyles.field}>
        <Text style={sharedStyles.label}>Observasjoner</Text>
        <TextInput
          style={[sharedStyles.input, sharedStyles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Hva la du merke til?"
          placeholderTextColor={Colors.mid + '80'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={sharedStyles.field}>
        <Text style={sharedStyles.label}>Bilder (valgfritt)</Text>
        <View style={styles.photoRow}>
          {photoUris.map((uri) => (
            <View key={uri} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
              <Pressable style={styles.photoRemoveBtn} onPress={() => onRemovePhoto(uri)} hitSlop={6}>
                <Text style={styles.photoRemoveText}>✕</Text>
              </Pressable>
            </View>
          ))}
          {photoUris.length < 4 && (
            <Pressable style={styles.photoAddBtn} onPress={onAddPhoto}>
              <Text style={styles.photoAddIcon}>📷</Text>
              <Text style={styles.photoAddText}>Legg til</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Text style={sharedStyles.label}>Kubehumør</Text>
      <View style={styles.moodRow}>
        {MOOD_EMOJIS.map((emoji, i) => {
          const score = i + 1;
          return (
            <Pressable
              key={score}
              style={[styles.moodBtn, moodScore === score && styles.moodBtnSelected]}
              onPress={() => setMoodScore(score)}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
              <Text style={styles.moodLabel}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  moodBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
  },
  moodBtnSelected: { borderColor: Colors.honey, backgroundColor: Colors.amber },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.mid, marginTop: 4 },

  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  photoThumbWrap: { position: 'relative', width: 76, height: 76 },
  photoThumb: { width: 76, height: 76, borderRadius: 10 },
  photoRemoveBtn: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.error, borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  photoAddBtn: {
    width: 76, height: 76, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.mid + '40',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    backgroundColor: Colors.white,
  },
  photoAddIcon: { fontSize: 22 },
  photoAddText: { fontSize: 11, color: Colors.mid },
});
