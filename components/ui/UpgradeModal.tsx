import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';
import { fetchOfferings, purchasePackage, restorePurchases, mapEntitlementToTier, syncTierToSupabase } from '@/services/subscription';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation } from '@tanstack/react-query';

interface TierInfo {
  entitlement: string;
  label: string;
  price: string;
  features: string[];
  color: string;
}

const TIERS: TierInfo[] = [
  {
    entitlement: 'hobbyist',
    label: 'Hobbyist',
    price: '49 kr/mnd',
    color: Colors.honey,
    features: [
      'Ubegrenset antall kuber',
      'Høstlogging og statistikk',
      'Inspeksjonsbasert prognose',
      'Bierasebasert honningestim.',
    ],
  },
  {
    entitlement: 'profesjonell',
    label: 'Profesjonell',
    price: '149 kr/mnd',
    color: Colors.success,
    features: [
      'Alt i Hobbyist',
      'Full CSV/PDF-eksport',
      'Prioritert support',
      'Tidlig tilgang til nye funksjoner',
    ],
  },
  {
    entitlement: 'lag',
    label: 'Lag',
    price: '499 kr/mnd',
    color: Colors.dark,
    features: [
      'Alt i Profesjonell',
      'Opptil 50 brukere',
      'Delt kubeoversikt',
      'Teamadministrasjon',
    ],
  },
];

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { profile, setProfile } = useAuthStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: packages = [] } = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: fetchOfferings,
    enabled: visible,
  });

  const handlePurchase = async (entitlement: string) => {
    const pkg = packages.find((p) =>
      p.product.identifier.includes(entitlement) ||
      p.offeringIdentifier?.includes(entitlement)
    );

    if (!pkg) {
      Alert.alert('Produkt ikke tilgjengelig', 'Abonnementet er ikke konfigurert ennå. Prøv igjen senere.');
      return;
    }

    setPurchasing(entitlement);
    try {
      const info = await purchasePackage(pkg);
      const tier = mapEntitlementToTier(info);
      await syncTierToSupabase(tier).catch(() => {});
      if (profile) setProfile({ ...profile, subscriptionTier: tier });
      onClose();
    } catch (e: unknown) {
      if ((e as { userCancelled?: boolean }).userCancelled) return;
      Alert.alert('Kjøp feilet', 'Prøv igjen eller kontakt support.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing('restore');
    try {
      const info = await restorePurchases();
      const tier = mapEntitlementToTier(info);
      await syncTierToSupabase(tier).catch(() => {});
      if (profile) setProfile({ ...profile, subscriptionTier: tier });
      Alert.alert('Kjøp gjenopprettet', `Abonnement: ${tier}`);
      onClose();
    } catch {
      Alert.alert('Feil', 'Kunne ikke gjenopprette kjøp.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Oppgrader BiApp</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Lukk">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {TIERS.map((tier) => (
            <View key={tier.entitlement} style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierLabel}>{tier.label}</Text>
                <Text style={[styles.tierPrice, { color: tier.color }]}>{tier.price}</Text>
              </View>
              <View style={styles.featureList}>
                {tier.features.map((f) => (
                  <Text key={f} style={styles.feature}>✓ {f}</Text>
                ))}
              </View>
              <Pressable
                style={[styles.buyBtn, { backgroundColor: tier.color }, purchasing ? styles.buyBtnDisabled : null]}
                onPress={() => handlePurchase(tier.entitlement)}
                disabled={!!purchasing}
              >
                {purchasing === tier.entitlement ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buyBtnText}>Velg {tier.label}</Text>
                )}
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={!!purchasing}>
            {purchasing === 'restore' ? (
              <ActivityIndicator color={Colors.mid} size="small" />
            ) : (
              <Text style={styles.restoreText}>Gjenopprett tidligere kjøp</Text>
            )}
          </Pressable>

          <Text style={styles.legal}>
            Abonnementet fornyes automatisk. Avbestill i Google Play → Abonnementer.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '18',
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 18, color: Colors.mid },
  content: { padding: 20, gap: 16, paddingBottom: 40 },

  tierCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    ...Shadows.card,
  },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  tierLabel: { fontSize: 18, fontWeight: '800', color: Colors.dark },
  tierPrice: { fontSize: 16, fontWeight: '700' },
  featureList: { gap: 6 },
  feature: { fontSize: 14, color: Colors.mid },

  buyBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnDisabled: { opacity: 0.6 },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  restoreBtn: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 14, color: Colors.mid },
  legal: { fontSize: 11, color: Colors.mid + 'AA', textAlign: 'center', lineHeight: 16 },
});
