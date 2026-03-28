import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface ReportSwarmModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string, contactInfo: string) => void;
  loading: boolean;
  locationName?: string;
}

export function ReportSwarmModal({ visible, onClose, onSubmit, loading, locationName }: ReportSwarmModalProps) {
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleSubmit = () => {
    onSubmit(description.trim(), contactInfo.trim());
    setDescription('');
    setContactInfo('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Rapporter svirm 🐝</Text>

        {locationName ? (
          <Text style={styles.location}>📍 {locationName}</Text>
        ) : (
          <Text style={styles.location}>📍 Din nåværende posisjon</Text>
        )}

        <Text style={styles.label}>Beskrivelse (valgfritt)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="f.eks. Stor svirm i epletreet, ca. 2 meter opp"
          placeholderTextColor={Colors.mid + '80'}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Kontaktinfo (valgfritt)</Text>
        <TextInput
          style={styles.input}
          value={contactInfo}
          onChangeText={setContactInfo}
          placeholder="Telefon eller e-post hvis du vil bli kontaktet"
          placeholderTextColor={Colors.mid + '80'}
          keyboardType="email-address"
        />

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Send rapport</Text>
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
  location: { fontSize: 13, color: Colors.mid, marginTop: -4 },
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
  multiline: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
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
