import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/colors';
import { Hive } from '@/types';

interface HarvestLogModalProps {
  visible: boolean;
  hives: Hive[];
  onClose: () => void;
  onSubmit: (hiveId: string, harvestedAt: string, quantityKg: number, notes: string) => void;
  loading: boolean;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateNO(d: Date): string {
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function HarvestLogModal({ visible, hives, onClose, onSubmit, loading }: HarvestLogModalProps) {
  const [selectedHiveId, setSelectedHiveId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [kg, setKg] = useState(10);
  const [kgText, setKgText] = useState('10');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedHiveId(hives.length === 1 ? hives[0].id : null);
      setDate(new Date());
      setShowPicker(Platform.OS === 'ios');
      setKg(10);
      setKgText('10');
      setNotes('');
    }
  }, [visible, hives]);

  const adjustKg = (delta: number) => {
    const next = Math.max(0.1, Math.min(200, Math.round((kg + delta) * 10) / 10));
    setKg(next);
    setKgText(String(next));
  };

  const handleKgText = (text: string) => {
    setKgText(text);
    const parsed = parseFloat(text.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0 && parsed <= 200) {
      setKg(Math.round(parsed * 10) / 10);
    }
  };

  const canSubmit = selectedHiveId !== null && kg > 0 && !loading;

  const handleSubmit = () => {
    if (!canSubmit || selectedHiveId === null) return;
    onSubmit(selectedHiveId, toDateString(date), kg, notes.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Logg høst</Text>

        {/* Hive selector */}
        {hives.length > 1 && (
          <>
            <Text style={styles.label}>Velg kube</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hivesRow}>
              {hives.map((hive) => (
                <Pressable
                  key={hive.id}
                  style={[styles.hiveChip, selectedHiveId === hive.id && styles.hiveChipSelected]}
                  onPress={() => setSelectedHiveId(hive.id)}
                >
                  <Text style={[styles.hiveChipText, selectedHiveId === hive.id && styles.hiveChipTextSelected]}>
                    {hive.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
        {hives.length === 1 && (
          <View style={styles.singleHive}>
            <Text style={styles.singleHiveLabel}>Kube</Text>
            <Text style={styles.singleHiveName}>{hives[0].name}</Text>
          </View>
        )}
        {hives.length === 0 && (
          <Text style={styles.noHives}>Ingen aktive kuber registrert.</Text>
        )}

        {/* Date picker */}
        <Text style={styles.label}>Dato</Text>
        {Platform.OS === 'android' && (
          <Pressable style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateBtnText}>{formatDateNO(date)}</Text>
          </Pressable>
        )}
        {(Platform.OS === 'ios' || showPicker) && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowPicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
            locale="nb-NO"
            style={styles.datePicker}
          />
        )}

        {/* Kg stepper */}
        <Text style={styles.label}>Mengde (kg)</Text>
        <View style={styles.kgRow}>
          <Pressable style={styles.stepBtn} onPress={() => adjustKg(-0.5)}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <TextInput
            style={styles.kgInput}
            value={kgText}
            onChangeText={handleKgText}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
          <Text style={styles.kgUnit}>kg</Text>
          <Pressable style={styles.stepBtn} onPress={() => adjustKg(0.5)}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notater (valgfritt)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder="f.eks. klar honning, mørk smak, god avling"
          placeholderTextColor={Colors.mid + '80'}
          multiline
          numberOfLines={2}
        />

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { opacity: 0.85 },
            !canSubmit && { opacity: 0.45 },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Logg høst</Text>
          )}
        </Pressable>

        <Pressable style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Avbryt</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000040' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 10,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.mid + '40',
    alignSelf: 'center', marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.5 },
  hivesRow: { gap: 8, paddingBottom: 4 },
  hiveChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
  },
  hiveChipSelected: {
    backgroundColor: Colors.honey + '20',
    borderColor: Colors.honey,
  },
  hiveChipText: { fontSize: 14, color: Colors.mid, fontWeight: '600' },
  hiveChipTextSelected: { color: Colors.honeyDark },
  singleHive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.amber,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  singleHiveLabel: { fontSize: 13, color: Colors.mid },
  singleHiveName: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  noHives: { fontSize: 14, color: Colors.mid, textAlign: 'center' },
  dateBtn: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  dateBtnText: { fontSize: 15, color: Colors.dark },
  datePicker: { alignSelf: 'flex-start', marginLeft: -8 },
  kgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  stepBtnText: { fontSize: 22, fontWeight: '700', color: Colors.dark, lineHeight: 26 },
  kgInput: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  kgUnit: { fontSize: 16, color: Colors.mid, fontWeight: '600' },
  input: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  multiline: { height: 64, paddingTop: 12, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: Colors.mid },
});
