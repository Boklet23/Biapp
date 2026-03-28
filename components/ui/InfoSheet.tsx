import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface InfoSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function InfoSheet({ visible, title, onClose, children }: InfoSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeBtnText}>Lukk</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function InfoText({ children }: { children: string }) {
  return <Text style={styles.infoText}>{children}</Text>;
}

export function InfoRow({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <View style={styles.infoRowContent}>
        <Text style={styles.infoRowTitle}>{title}</Text>
        <Text style={styles.infoRowDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.mid + '30',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 23,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoRowIcon: { fontSize: 28, marginTop: 2 },
  infoRowContent: { flex: 1 },
  infoRowTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  infoRowDesc: { fontSize: 14, color: Colors.mid, lineHeight: 20 },
  closeBtn: {
    marginTop: 16,
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.honeyDark },
});
