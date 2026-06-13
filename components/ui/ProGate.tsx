import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors, Shadows } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

interface ProGateProps {
  /** Navnet på funksjonen, f.eks. "Sammenligning av kuber". */
  feature: string;
}

/** Vises når en bruker uten Profesjonell-tilgang når en gated skjerm. */
export function ProGate({ feature }: ProGateProps) {
  const [upgradeVisible, setUpgradeVisible] = useState(false);

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
          onPress={() => setUpgradeVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Oppgrader til Profesjonell for å bruke ${feature}`}
        >
          <Text style={styles.btnText}>Oppgrader til Profesjonell</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.backText}>Tilbake</Text>
        </Pressable>
      </View>

      <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        title="Oppgrader til Profesjonell"
        subtitle={`${feature} og mer er inkludert i Profesjonell.`}
      />
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
  backBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  backText: { fontSize: 14, fontFamily: FontFamily.regular, color: Colors.mid },
});
