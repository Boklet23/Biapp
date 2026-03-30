import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/colors';

interface AddEventModalProps {
  visible: boolean;
  initialDate: string | null; // 'YYYY-MM-DD'
  onClose: () => void;
  onSubmit: (title: string, date: string, notes: string) => void;
  loading: boolean;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateNO(d: Date): string {
  return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function AddEventModal({ visible, initialDate, onClose, onSubmit, loading }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date>(() => {
    if (initialDate) {
      const [y, m, d] = initialDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setNotes('');
      setShowPicker(Platform.OS === 'ios');
      if (initialDate) {
        const [y, m, d] = initialDate.split('-').map(Number);
        setDate(new Date(y, m - 1, d));
      } else {
        setDate(new Date());
      }
    }
  }, [visible, initialDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), toDateString(date), notes.trim());
    setTitle('');
    setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Ny hendelse 📅</Text>

        <Text style={styles.label}>Tittel</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="f.eks. Varroa-behandling, Honningslynging"
          placeholderTextColor={Colors.mid + '80'}
          autoFocus
        />

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
            onChange={(_, selected) => {
              setShowPicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
            locale="nb-NO"
            style={styles.datePicker}
          />
        )}

        <Text style={styles.label}>Notater (valgfritt)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Hva skal gjøres?"
          placeholderTextColor={Colors.mid + '80'}
          multiline
          numberOfLines={2}
        />

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { opacity: 0.85 },
            (!title.trim() || loading) && { opacity: 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={!title.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Lagre hendelse</Text>
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
    gap: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.mid + '40',
    alignSelf: 'center', marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.dark },
  label: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.5 },
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
  multiline: { height: 72, paddingTop: 12, textAlignVertical: 'top' },
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
  submitBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: Colors.mid },
});
