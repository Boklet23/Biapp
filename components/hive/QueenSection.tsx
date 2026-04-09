import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Shadows } from '@/constants/colors';
import { createQueen, deleteQueen, fetchQueens, updateQueenReplaced } from '@/services/queen';
import { Queen } from '@/types';

const ORIGINS = ['Egenoppdratt', 'Kjøpt', 'Naturlig sverm', 'Avlegger', 'Annet'];
const BREEDS = ['Norsk landbee', 'Buckfast', 'Carniolan', 'Annet'];
const MARK_COLORS = ['hvit', 'gul', 'rød', 'grønn', 'blå'];
const MARK_HEX: Record<string, string> = {
  hvit: '#FFFFFF', gul: '#F5C542', rød: '#E74C3C', grønn: '#27AE60', blå: '#2980B9',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function queenAge(introducedAt: string, replacedAt: string | null): string {
  const end = replacedAt ? new Date(replacedAt) : new Date();
  const start = new Date(introducedAt);
  const months = Math.floor((end.getTime() - start.getTime()) / (30 * 86400000));
  if (months < 1) return 'Under 1 mnd';
  if (months < 12) return `${months} mnd`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} år ${rem} mnd` : `${years} år`;
}

interface AddQueenModalProps {
  hiveId: string;
  visible: boolean;
  onClose: () => void;
}

function AddQueenModal({ hiveId, visible, onClose }: AddQueenModalProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [breed, setBreed] = useState(BREEDS[0]);
  const [color, setColor] = useState(MARK_COLORS[0]);
  const [notes, setNotes] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => createQueen({ hiveId, introducedAt: date, origin, breed, markedColor: color, notes: notes.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queens', hiveId] });
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onClose();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        <View style={modal.header}>
          <Pressable onPress={onClose} hitSlop={12}><Text style={modal.cancel}>Avbryt</Text></Pressable>
          <Text style={modal.title}>Logg dronning</Text>
          <Pressable onPress={() => isValidDate && mutate()} disabled={!isValidDate || isPending} hitSlop={12}>
            <Text style={[modal.save, (!isValidDate || isPending) && modal.saveDisabled]}>Lagre</Text>
          </Pressable>
        </View>
        <ScrollView style={modal.scroll} contentContainerStyle={modal.content}>
          <Text style={modal.label}>Innsatt dato</Text>
          <TextInput style={modal.input} value={date} onChangeText={setDate} placeholder="ÅÅÅÅ-MM-DD" keyboardType="numeric" />

          <Text style={modal.label}>Opprinnelse</Text>
          <View style={modal.chipRow}>
            {ORIGINS.map((o) => (
              <Pressable key={o} style={[modal.chip, origin === o && modal.chipActive]} onPress={() => setOrigin(o)}>
                <Text style={[modal.chipText, origin === o && modal.chipTextActive]}>{o}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={modal.label}>Rase</Text>
          <View style={modal.chipRow}>
            {BREEDS.map((b) => (
              <Pressable key={b} style={[modal.chip, breed === b && modal.chipActive]} onPress={() => setBreed(b)}>
                <Text style={[modal.chipText, breed === b && modal.chipTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={modal.label}>Merkefarge</Text>
          <View style={modal.colorRow}>
            {MARK_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[modal.colorDot, { backgroundColor: MARK_HEX[c], borderWidth: color === c ? 3 : 1 }]}
                onPress={() => setColor(c)}
              >
                {color === c && <Text style={modal.colorCheck}>✓</Text>}
              </Pressable>
            ))}
          </View>

          <Text style={modal.label}>Notater (valgfritt)</Text>
          <TextInput style={[modal.input, modal.textArea]} value={notes} onChangeText={setNotes}
            placeholder="Observasjoner..." multiline numberOfLines={3} />
        </ScrollView>
      </View>
    </Modal>
  );
}

interface QueenSectionProps {
  hiveId: string;
}

export function QueenSection({ hiveId }: QueenSectionProps) {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: queens = [] } = useQuery({
    queryKey: ['queens', hiveId],
    queryFn: () => fetchQueens(hiveId),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteQueen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queens', hiveId] }),
  });

  const { mutate: markReplaced } = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => updateQueenReplaced(id, date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queens', hiveId] }),
  });

  const handleLongPress = (q: Queen) => {
    Alert.alert('Dronning', q.breed ?? 'Ukjent rase', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Merk som erstattet',
        onPress: () => markReplaced({ id: q.id, date: new Date().toISOString().split('T')[0] }),
      },
      { text: 'Slett', style: 'destructive', onPress: () => remove(q.id) },
    ]);
  };

  const current = queens.find((q) => !q.replacedAt);
  const previous = queens.filter((q) => q.replacedAt);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Dronning</Text>
        <Pressable onPress={() => setModalVisible(true)} hitSlop={10}>
          <Text style={styles.addBtn}>+ Logg dronning</Text>
        </Pressable>
      </View>

      {queens.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👑</Text>
          <Text style={styles.emptyText}>Ingen dronning registrert</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {current && (
            <Pressable style={styles.currentRow} onLongPress={() => handleLongPress(current)}>
              <View style={styles.currentLeft}>
                {current.markedColor && (
                  <View style={[styles.colorBadge, { backgroundColor: MARK_HEX[current.markedColor] ?? '#999' }]} />
                )}
                <View>
                  <Text style={styles.currentLabel}>Aktiv dronning</Text>
                  <Text style={styles.currentBreed}>{current.breed ?? 'Ukjent rase'}</Text>
                  <Text style={styles.currentSub}>{current.origin ?? ''} · Inn: {formatDate(current.introducedAt)}</Text>
                </View>
              </View>
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{queenAge(current.introducedAt, null)}</Text>
              </View>
            </Pressable>
          )}
          {previous.length > 0 && (
            <View style={styles.prevSection}>
              <Text style={styles.prevTitle}>Tidligere dronninger</Text>
              {previous.map((q, i) => (
                <Pressable
                  key={q.id}
                  style={[styles.prevRow, i < previous.length - 1 && styles.prevBorder]}
                  onLongPress={() => handleLongPress(q)}
                >
                  <Text style={styles.prevBreed}>{q.breed ?? 'Ukjent'}</Text>
                  <Text style={styles.prevDates}>
                    {formatDate(q.introducedAt)} – {q.replacedAt ? formatDate(q.replacedAt) : ''}
                    {' '}({queenAge(q.introducedAt, q.replacedAt)})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <AddQueenModal hiveId={hiveId} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.8 },
  addBtn: { fontSize: 14, color: Colors.honey, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', ...Shadows.card },
  currentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  currentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  colorBadge: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: Colors.mid + '30' },
  currentLabel: { fontSize: 11, color: Colors.success, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  currentBreed: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginTop: 2 },
  currentSub: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  ageBadge: { backgroundColor: Colors.honey + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ageText: { fontSize: 12, fontWeight: '700', color: Colors.honey },
  prevSection: { borderTopWidth: 1, borderTopColor: Colors.mid + '15', padding: 16, gap: 0 },
  prevTitle: { fontSize: 11, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  prevRow: { paddingVertical: 8, gap: 2 },
  prevBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '12' },
  prevBreed: { fontSize: 13, fontWeight: '600', color: Colors.dark },
  prevDates: { fontSize: 11, color: Colors.mid },
  empty: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 14, color: Colors.mid },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mid + '15' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cancel: { fontSize: 16, color: Colors.mid },
  save: { fontSize: 16, color: Colors.honey, fontWeight: '700' },
  saveDisabled: { opacity: 0.4 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.dark, borderWidth: 1, borderColor: Colors.mid + '20' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.mid + '30' },
  chipActive: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  chipText: { fontSize: 13, color: Colors.mid, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  colorCheck: { fontSize: 16, color: Colors.dark, fontWeight: '800' },
});
