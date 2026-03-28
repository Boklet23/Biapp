import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { BeeAssociation } from '@/constants/beeAssociations';

interface AssociationCardProps {
  association: BeeAssociation;
}

export function AssociationCard({ association }: AssociationCardProps) {
  const handleWebsite = () => {
    if (association.website) Linking.openURL(association.website);
  };

  const handleEmail = () => {
    if (association.email) Linking.openURL(`mailto:${association.email}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{association.name}</Text>
          <Text style={styles.county}>📍 {association.county}</Text>
        </View>
      </View>

      {(association.website || association.email) && (
        <View style={styles.actions}>
          {association.website && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={handleWebsite}
              accessibilityRole="link"
              accessibilityLabel={`Åpne nettside til ${association.name}`}
            >
              <Text style={styles.actionBtnText}>🌐 Nettside</Text>
            </Pressable>
          )}
          {association.email && (
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={handleEmail}
              accessibilityRole="link"
              accessibilityLabel={`Send e-post til ${association.name}`}
            >
              <Text style={styles.actionBtnText}>✉️ E-post</Text>
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
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  county: { fontSize: 12, color: Colors.mid },
  actions: { flexDirection: 'row', gap: 8 },
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
