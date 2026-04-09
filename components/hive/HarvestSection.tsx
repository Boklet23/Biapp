import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Shadows } from '@/constants/colors';
import { createHarvest, deleteHarvest, fetchHarvests } from '@/services/harvest';
import { HarvestRecord } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface AddModalProps {
  hiveId: string;
  visible: boolean;
  onClose: () => void;
}

const HONEY_TYPES = ['Blomsterhonning', 'Lyndehonning', 'Skogshonning', 'Raps', 'Kløver', 'Annet'];
const HONEY_COLORS = [
  { label: 'Lys gul', color: '#FFF3A0' },
  { label: 'Gyllen', color: '#F5C542' },
  { label: 'Amber', color: '#D4842A' },
  { label: 'Mørk', color: '#7B4A1A' },
];

function AddHarvestModal({ hiveId, visible, onClose }: AddModalProps) {
  const queryClient = useQueryClient();
  const [kgStr, setKgStr] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [honeyType, setHoneyType] = useState('');
  const [honeyColor, setHoneyColor] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => createHarvest({
      hiveId,
      harvestedAt: date,
      quantityKg: parseFloat(kgStr.replace(',', '.')),
      notes: [honeyType, honeyColor, notes.trim()].filter(Boolean).join(' · ') || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      setKgStr('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setHoneyType('');
      setHoneyColor('');
      onClose();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canSave = isValidDate && kgStr.trim().length > 0 && !isNaN(parseFloat(kgStr.replace(',', '.')));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        <View style={modal.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={modal.cancel}>Avbryt</Text>
          </Pressable>
          <Text style={modal.title}>Logg høsting</Text>
          <Pressable onPress={() => canSave && mutate()} disabled={!canSave || isPending} hitSlop={12}>
            <Text style={[modal.save, (!canSave || isPending) && modal.saveDisabled]}>Lagre</Text>
          </Pressable>
        </View>

        <ScrollView style={modal.scroll} contentContainerStyle={modal.content}>
          <Text style={modal.label}>Dato</Text>
          <TextInput style={modal.input} value={date} onChangeText={setDate} placeholder="ÅÅÅÅ-MM-DD" keyboardType="numeric" />

          <Text style={modal.label}>Mengde (kg)</Text>
          <TextInput
            style={modal.input}
            value={kgStr}
            onChangeText={setKgStr}
            placeholder="f.eks. 12.5"
            keyboardType="decimal-pad"
          />

          <Text style={modal.label}>Sorttype (valgfritt)</Text>
          <View style={modal.chipRow}>
            {HONEY_TYPES.map((t) => (
              <Pressable key={t} style={[modal.chip, honeyType === t && modal.chipActive]} onPress={() => setHoneyType(honeyType === t ? '' : t)}>
                <Text style={[modal.chipText, honeyType === t && modal.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={modal.label}>Farge (valgfritt)</Text>
          <View style={modal.colorRow}>
            {HONEY_COLORS.map((c) => (
              <Pressable
                key={c.label}
                style={[modal.colorSwatch, { backgroundColor: c.color, borderWidth: honeyColor === c.label ? 3 : 1 }]}
                onPress={() => setHoneyColor(honeyColor === c.label ? '' : c.label)}
              />
            ))}
          </View>

          <Text style={modal.label}>Ekstra notater (valgfritt)</Text>
          <TextInput
            style={[modal.input, modal.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Smak, konsistens, annet..."
            multiline
            numberOfLines={2}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

interface HarvestSectionProps {
  hiveId: string;
}

export function HarvestSection({ hiveId }: HarvestSectionProps) {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: allHarvests = [] } = useQuery({
    queryKey: ['harvests'],
    queryFn: fetchHarvests,
  });

  const harvests = allHarvests.filter((h) => h.hiveId === hiveId);

  const { mutate: remove } = useMutation({
    mutationFn: deleteHarvest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['harvests'] }),
  });

  const handleLongPress = (h: HarvestRecord) => {
    Alert.alert('Slett høsting', `Slett ${h.quantityKg} kg (${formatDate(h.harvestedAt)})?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => remove(h.id) },
    ]);
  };

  const totalKg = Math.round(harvests.reduce((s, h) => s + h.quantityKg, 0) * 10) / 10;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Høstlogg{totalKg > 0 ? ` · ${totalKg} kg totalt` : ''}</Text>
        <Pressable onPress={() => setModalVisible(true)} hitSlop={10}>
          <Text style={styles.addBtn}>+ Logg høst</Text>
        </Pressable>
      </View>

      {harvests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍯</Text>
          <Text style={styles.emptyText}>Ingen høstinger logget ennå</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {harvests.slice(0, 5).map((h, i) => (
            <Pressable
              key={h.id}
              style={[styles.row, i < Math.min(harvests.length, 5) - 1 && styles.rowBorder]}
              onLongPress={() => handleLongPress(h)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.kg}>{h.quantityKg} kg</Text>
                {h.notes && <Text style={styles.notes} numberOfLines={1}>{h.notes}</Text>}
              </View>
              <Text style={styles.date}>{formatDate(h.harvestedAt)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <AddHarvestModal hiveId={hiveId} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.8 },
  addBtn: { fontSize: 14, color: Colors.honey, fontWeight: '700' },
  list: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', ...Shadows.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '12' },
  rowLeft: { flex: 1, gap: 2 },
  kg: { fontSize: 15, fontWeight: '700', color: Colors.honey },
  notes: { fontSize: 12, color: Colors.mid },
  date: { fontSize: 12, color: Colors.mid },
  empty: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 14, color: Colors.mid },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mid + '15',
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cancel: { fontSize: 16, color: Colors.mid },
  save: { fontSize: 16, color: Colors.honey, fontWeight: '700' },
  saveDisabled: { opacity: 0.4 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: Colors.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.dark,
    borderWidth: 1, borderColor: Colors.mid + '20',
  },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.mid + '30' },
  chipActive: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  chipText: { fontSize: 12, color: Colors.mid, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  colorSwatch: { width: 32, height: 32, borderRadius: 8, borderColor: Colors.dark },
});
