import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Shadows } from '@/constants/colors';
import { createTreatment, deleteTreatment, fetchTreatments } from '@/services/treatment';
import { Treatment } from '@/types';

const PRODUCTS = [
  'Apivar (amitraz)',
  'Oxalsyre (drypp)',
  'Oxalsyre (fordamping)',
  'Thymovar',
  'MAQS (maursyre)',
  'Api-Bioxal',
  'Apistan',
  'Annet',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface AddModalProps {
  hiveId: string;
  visible: boolean;
  onClose: () => void;
}

function AddTreatmentModal({ hiveId, visible, onClose }: AddModalProps) {
  const queryClient = useQueryClient();
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [customProduct, setCustomProduct] = useState('');
  const [dose, setDose] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createTreatment({
      hiveId,
      treatedAt: date,
      product: product === 'Annet' ? customProduct.trim() : product,
      dose: dose.trim() || undefined,
      method: method.trim() || undefined,
      notes: notes.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments', hiveId] });
      setProduct(PRODUCTS[0]);
      setCustomProduct('');
      setDose('');
      setMethod('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canSave = isValidDate && (product !== 'Annet' || customProduct.trim().length > 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        <View style={modal.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={modal.cancel}>Avbryt</Text>
          </Pressable>
          <Text style={modal.title}>Logg behandling</Text>
          <Pressable onPress={() => canSave && mutate()} disabled={!canSave || isPending} hitSlop={12}>
            <Text style={[modal.save, (!canSave || isPending) && modal.saveDisabled]}>Lagre</Text>
          </Pressable>
        </View>

        <ScrollView style={modal.scroll} contentContainerStyle={modal.scrollContent}>
          <Text style={modal.label}>Dato</Text>
          <TextInput
            style={modal.input}
            value={date}
            onChangeText={setDate}
            placeholder="ÅÅÅÅ-MM-DD"
            keyboardType="numeric"
          />

          <Text style={modal.label}>Preparat</Text>
          <View style={modal.productGrid}>
            {PRODUCTS.map((p) => (
              <Pressable
                key={p}
                style={[modal.productChip, product === p && modal.productChipActive]}
                onPress={() => setProduct(p)}
              >
                <Text style={[modal.productChipText, product === p && modal.productChipTextActive]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          {product === 'Annet' && (
            <TextInput
              style={modal.input}
              value={customProduct}
              onChangeText={setCustomProduct}
              placeholder="Navn på preparat"
            />
          )}

          <Text style={modal.label}>Dosering (valgfritt)</Text>
          <TextInput
            style={modal.input}
            value={dose}
            onChangeText={setDose}
            placeholder="f.eks. 2 strimler, 35g"
          />

          <Text style={modal.label}>Metode (valgfritt)</Text>
          <TextInput
            style={modal.input}
            value={method}
            onChangeText={setMethod}
            placeholder="f.eks. drypp, fordamping, strimler"
          />

          <Text style={modal.label}>Notater (valgfritt)</Text>
          <TextInput
            style={[modal.input, modal.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observasjoner, tilstand..."
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

interface TreatmentRowProps {
  item: Treatment;
  onDelete: (id: string) => void;
}

function TreatmentRow({ item, onDelete }: TreatmentRowProps) {
  const handleLongPress = () => {
    Alert.alert('Slett behandling', `Slett ${item.product}?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <Pressable style={styles.row} onLongPress={handleLongPress}>
      <View style={styles.rowLeft}>
        <Text style={styles.product}>{item.product}</Text>
        <Text style={styles.date}>{formatDate(item.treatedAt)}</Text>
        {item.dose && <Text style={styles.sub}>{item.dose}</Text>}
      </View>
      {item.method && <Text style={styles.method}>{item.method}</Text>}
    </Pressable>
  );
}

interface TreatmentSectionProps {
  hiveId: string;
}

export function TreatmentSection({ hiveId }: TreatmentSectionProps) {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: treatments = [] } = useQuery({
    queryKey: ['treatments', hiveId],
    queryFn: () => fetchTreatments(hiveId),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteTreatment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['treatments', hiveId] }),
  });

  const visible = showAll ? treatments : treatments.slice(0, 3);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Behandlingslogg ({treatments.length})</Text>
        <Pressable onPress={() => setModalVisible(true)} hitSlop={10}>
          <Text style={styles.addBtn}>+ Legg til</Text>
        </Pressable>
      </View>

      {treatments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💊</Text>
          <Text style={styles.emptyText}>Ingen behandlinger logget</Text>
          <Text style={styles.emptyHint}>Hold inne en rad for å slette</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visible.map((t, i) => (
            <View key={t.id} style={i < visible.length - 1 && styles.rowBorder}>
              <TreatmentRow item={t} onDelete={remove} />
            </View>
          ))}
          {treatments.length > 3 && (
            <Pressable onPress={() => setShowAll((v) => !v)} style={styles.showMore}>
              <Text style={styles.showMoreText}>
                {showAll ? 'Vis færre' : `Vis alle ${treatments.length}`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <AddTreatmentModal
        hiveId={hiveId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  addBtn: { fontSize: 14, color: Colors.honey, fontWeight: '700' },

  list: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadows.card,
  },
  row: { paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.mid + '12' },
  rowLeft: { flex: 1, gap: 2 },
  product: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  date: { fontSize: 12, color: Colors.mid },
  sub: { fontSize: 12, color: Colors.mid },
  method: { fontSize: 12, color: Colors.honey, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 14, color: Colors.mid, fontWeight: '600' },
  emptyHint: { fontSize: 12, color: Colors.mid },

  showMore: { paddingVertical: 12, alignItems: 'center' },
  showMoreText: { fontSize: 13, color: Colors.honey, fontWeight: '600' },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cancel: { fontSize: 16, color: Colors.mid },
  save: { fontSize: 16, color: Colors.honey, fontWeight: '700' },
  saveDisabled: { opacity: 0.4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 6, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mid + '30',
  },
  productChipActive: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  productChipText: { fontSize: 13, color: Colors.mid, fontWeight: '500' },
  productChipTextActive: { color: Colors.white, fontWeight: '700' },
});
