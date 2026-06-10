import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

interface ProGateProps {
  /** Navnet på funksjonen, f.eks. "Sammenligning av kuber". */
  feature: string;
}

/** Vises når en bruker uten Profesjonell-tilgang når en gated skjerm. */
export function ProGate({ feature }: ProGateProps) {
  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Profesjonell-funksjon</Text>
        <Text style={styles.body}>
          {feature} er tilgjengelig med Profesjonell-abonnement.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Tilbake</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emoji: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
  body: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.honey,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    ...Shadows.card,
  },
  btnText: { fontSize: 15, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
});
