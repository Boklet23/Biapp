import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { BeeAssociation } from '@/services/associations';

const TYPE_LABEL: Record<BeeAssociation['type'], string> = {
  nasjonal: '🇳🇴 Nasjonalt',
  fylke: '📋 Fylkeslag',
  lokal: '📍 Lokallag',
};

interface AssociationCardProps {
  association: BeeAssociation;
}

export function AssociationCard({ association }: AssociationCardProps) {
  const hasActions = association.website || association.email || association.phone || association.facebookUrl;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{association.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.county}>{association.county}</Text>
            <Text style={styles.typeBadge}>{TYPE_LABEL[association.type]}</Text>
          </View>
          {association.contactPerson && (
            <Text style={styles.contactPerson}>Kontaktperson: {association.contactPerson}</Text>
          )}
        </View>
      </View>

      {hasActions && (
        <View style={styles.actions}>
          {association.website && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => Linking.openURL(association.website!)}
              accessibilityRole="link"
              accessibilityLabel={`Åpne nettside til ${association.name}`}
            >
              <Text style={styles.actionBtnText}>🌐 Nettside</Text>
            </Pressable>
          )}
          {association.email && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => Linking.openURL(`mailto:${association.email}`)}
              accessibilityRole="link"
              accessibilityLabel={`Send e-post til ${association.name}`}
            >
              <Text style={styles.actionBtnText}>✉️ E-post</Text>
            </Pressable>
          )}
          {association.phone && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => Linking.openURL(`tel:${association.phone}`)}
              accessibilityRole="link"
              accessibilityLabel={`Ring ${association.name}`}
            >
              <Text style={styles.actionBtnText}>📞 Mobil</Text>
            </Pressable>
          )}
          {association.facebookUrl && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => Linking.openURL(association.facebookUrl!)}
              accessibilityRole="link"
              accessibilityLabel={`Åpne Facebook-side til ${association.name}`}
            >
              <Text style={styles.actionBtnText}>🔵 Facebook</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  county: { fontSize: 12, color: Colors.mid },
  typeBadge: { fontSize: 11, color: Colors.mid + 'bb' },
  contactPerson: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.honey + '12',
    borderWidth: 1,
    borderColor: Colors.honey + '30',
  },
  actionBtnPressed: { opacity: 0.7 },
  actionBtnText: { fontSize: 13, color: Colors.honey, fontWeight: '600' },
});
