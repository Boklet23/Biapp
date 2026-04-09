import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Shadows } from '@/constants/colors';
import { createWeight, deleteWeight, fetchWeights } from '@/services/weight';
import { HiveWeight } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

interface AddModalProps {
  hiveId: string;
  visible: boolean;
  onClose: () => void;
}

function AddWeightModal({ hiveId, visible, onClose }: AddModalProps) {
  const queryClient = useQueryClient();
  const [weightStr, setWeightStr] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createWeight({
      hiveId,
      weighedAt: date,
      weightKg: parseFloat(weightStr.replace(',', '.')),
      notes: notes.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights', hiveId] });
      setWeightStr('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canSave = isValidDate && weightStr.trim().length > 0 && !isNaN(parseFloat(weightStr.replace(',', '.')));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        <View style={modal.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={modal.cancel}>Avbryt</Text>
          </Pressable>
          <Text style={modal.title}>Logg kubevekt</Text>
          <Pressable onPress={() => canSave && mutate()} disabled={!canSave || isPending} hitSlop={12}>
            <Text style={[modal.save, (!canSave || isPending) && modal.saveDisabled]}>Lagre</Text>
          </Pressable>
        </View>

        <ScrollView style={modal.scroll} contentContainerStyle={modal.content}>
          <Text style={modal.label}>Dato</Text>
          <TextInput style={modal.input} value={date} onChangeText={setDate} placeholder="ÅÅÅÅ-MM-DD" keyboardType="numeric" />

          <Text style={modal.label}>Vekt (kg)</Text>
          <TextInput
            style={modal.input}
            value={weightStr}
            onChangeText={setWeightStr}
            placeholder="f.eks. 42.5"
            keyboardType="decimal-pad"
          />

          <Text style={modal.label}>Notater (valgfritt)</Text>
          <TextInput
            style={[modal.input, modal.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observasjoner..."
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

interface WeightChartProps {
  weights: HiveWeight[];
}

function WeightChart({ weights }: WeightChartProps) {
  const { width } = useWindowDimensions();
  const points = [...weights].slice(0, 8).reverse();
  if (points.length < 2) return null;

  const chartW = width - 80;
  const chartH = 80;
  const padX = 16;
  const padY = 10;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const vals = points.map((p) => p.weightKg);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = maxVal - minVal || 1;

  const pts = points.map((w, idx) => ({
    x: padX + (idx / (points.length - 1)) * innerW,
    y: padY + innerH - ((w.weightKg - minVal) / range) * innerH,
    kg: w.weightKg,
    date: w.weighedAt,
    id: w.id,
  }));

  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={chartW} height={chartH} style={{ marginTop: 8 }}>
      <Line x1={padX} y1={padY + innerH} x2={padX + innerW} y2={padY + innerH} stroke={Colors.mid + '30'} strokeWidth={1} />
      <Polyline points={poly} fill="none" stroke={Colors.info} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => (
        <Circle key={p.id} cx={p.x} cy={p.y} r={4} fill={Colors.info} stroke="#fff" strokeWidth={1.5} />
      ))}
      {pts.map((p) => (
        <SvgText key={`lbl-${p.id}`} x={p.x} y={chartH - 1} fontSize={9} fill={Colors.mid} textAnchor="middle">
          {formatDate(p.date)}
        </SvgText>
      ))}
    </Svg>
  );
}

interface WeightSectionProps {
  hiveId: string;
}

export function WeightSection({ hiveId }: WeightSectionProps) {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: weights = [] } = useQuery({
    queryKey: ['weights', hiveId],
    queryFn: () => fetchWeights(hiveId),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteWeight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weights', hiveId] }),
  });

  const handleLongPress = (w: HiveWeight) => {
    Alert.alert('Slett vektregistrering', `Slett ${w.weightKg} kg (${formatDate(w.weighedAt)})?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => remove(w.id) },
    ]);
  };

  const latest = weights[0];
  const previous = weights[1];
  const diff = latest && previous ? latest.weightKg - previous.weightKg : null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Kubevekt ({weights.length})</Text>
        <Pressable onPress={() => setModalVisible(true)} hitSlop={10}>
          <Text style={styles.addBtn}>+ Logg vekt</Text>
        </Pressable>
      </View>

      {weights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚖️</Text>
          <Text style={styles.emptyText}>Ingen vektregistreringer ennå</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {latest && (
            <View style={styles.latestRow}>
              <View>
                <Text style={styles.latestKg}>{latest.weightKg} kg</Text>
                <Text style={styles.latestDate}>{formatDate(latest.weighedAt)}</Text>
              </View>
              {diff !== null && (
                <View style={[styles.diffBadge, diff >= 0 ? styles.diffPos : styles.diffNeg]}>
                  <Text style={styles.diffText}>{diff >= 0 ? '+' : ''}{diff.toFixed(1)} kg</Text>
                </View>
              )}
            </View>
          )}
          <WeightChart weights={weights} />
          <View style={styles.historyList}>
            {weights.slice(0, 5).map((w, i) => (
              <Pressable
                key={w.id}
                style={[styles.histRow, i < Math.min(weights.length, 5) - 1 && styles.histBorder]}
                onLongPress={() => handleLongPress(w)}
              >
                <Text style={styles.histDate}>{formatDate(w.weighedAt)}</Text>
                <Text style={styles.histKg}>{w.weightKg} kg</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <AddWeightModal hiveId={hiveId} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.8 },
  addBtn: { fontSize: 14, color: Colors.honey, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, ...Shadows.card },
  latestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  latestKg: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  latestDate: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  diffPos: { backgroundColor: Colors.success + '20' },
  diffNeg: { backgroundColor: Colors.error + '20' },
  diffText: { fontSize: 13, fontWeight: '700', color: Colors.dark },
  historyList: { marginTop: 12 },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  histBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '12' },
  histDate: { fontSize: 13, color: Colors.mid },
  histKg: { fontSize: 13, fontWeight: '600', color: Colors.dark },
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
