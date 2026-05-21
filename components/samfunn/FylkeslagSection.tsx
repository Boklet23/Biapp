import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { BeeAssociation, FylkeslagGroup } from '@/services/associations';

interface FylkeslagSectionProps {
  group: FylkeslagGroup;
}

function LokallagCard({ l }: { l: BeeAssociation }) {
  return (
    <View style={styles.lokalCard}>
      <Text style={styles.lokalName} numberOfLines={2}>{l.name}</Text>
      {l.contactPerson && (
        <Text style={styles.lokalContact} numberOfLines={1}>{l.contactPerson}</Text>
      )}
      <View style={styles.lokalActions}>
        {l.email && (
          <Pressable
            onPress={() => Linking.openURL(`mailto:${l.email}`)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
            accessibilityRole="link"
            accessibilityLabel={`Send e-post til ${l.name}`}
          >
            <Text style={styles.iconBtnText}>✉️</Text>
          </Pressable>
        )}
        {l.phone && (
          <Pressable
            onPress={() => Linking.openURL(`tel:${l.phone}`)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
            accessibilityRole="link"
            accessibilityLabel={`Ring ${l.name}`}
          >
            <Text style={styles.iconBtnText}>📞</Text>
          </Pressable>
        )}
        {l.facebookUrl && (
          <Pressable
            onPress={() => Linking.openURL(l.facebookUrl!)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
            accessibilityRole="link"
            accessibilityLabel={`Facebook-side til ${l.name}`}
          >
            <Text style={styles.iconBtnText}>🔵</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function FylkeslagSection({ group }: FylkeslagSectionProps) {
  const { fylkeslag: f, lokallag } = group;

  return (
    <View style={styles.section}>
      <View style={styles.fylkeslagCard}>
        <View style={styles.titleRow}>
          <Text style={styles.fylkeslagName}>{f.name}</Text>
          {lokallag.length > 0 && (
            <Text style={styles.lokalCount}>{lokallag.length} lokallag</Text>
          )}
        </View>

        {f.contactPerson && (
          <Text style={styles.contactPerson}>Kontaktperson: {f.contactPerson}</Text>
        )}

        {(f.email || f.phone || f.facebookUrl || f.website) && (
          <View style={styles.actions}>
            {f.email && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Linking.openURL(`mailto:${f.email}`)}
                accessibilityRole="link"
                accessibilityLabel={`Send e-post til ${f.name}`}
              >
                <Text style={styles.actionBtnText}>✉️ E-post</Text>
              </Pressable>
            )}
            {f.phone && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Linking.openURL(`tel:${f.phone}`)}
                accessibilityRole="link"
                accessibilityLabel={`Ring ${f.name}`}
              >
                <Text style={styles.actionBtnText}>📞 Mobil</Text>
              </Pressable>
            )}
            {f.facebookUrl && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Linking.openURL(f.facebookUrl!)}
                accessibilityRole="link"
                accessibilityLabel={`Facebook-side til ${f.name}`}
              >
                <Text style={styles.actionBtnText}>🔵 Facebook</Text>
              </Pressable>
            )}
            {f.website && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Linking.openURL(f.website!)}
                accessibilityRole="link"
                accessibilityLabel={`Nettside til ${f.name}`}
              >
                <Text style={styles.actionBtnText}>🌐 Nettside</Text>
              </Pressable>
            )}
          </View>
        )}

        {lokallag.length > 0 && (
          <>
            <Text style={styles.lokalHeader}>LOKALLAG</Text>
            <View style={styles.grid}>
              {lokallag.map((l) => (
                <LokallagCard key={l.id} l={l} />
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 0,
  },
  fylkeslagCard: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fylkeslagName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.dark,
    flex: 1,
  },
  lokalCount: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: Colors.honey,
    backgroundColor: Colors.honey + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  contactPerson: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.honey + '12',
    borderWidth: 1,
    borderColor: Colors.honey + '30',
  },
  actionBtnText: {
    fontSize: 13,
    color: Colors.honey,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
  },
  lokalHeader: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.mid,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lokalCard: {
    width: '47%',
    backgroundColor: Colors.light,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.mid + '15',
  },
  lokalName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.dark,
    lineHeight: 17,
  },
  lokalContact: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
  },
  lokalActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  iconBtn: {
    padding: 2,
  },
  iconBtnText: {
    fontSize: 16,
  },
});
