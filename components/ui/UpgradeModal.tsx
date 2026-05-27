import { useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';
import { fetchOfferings, purchasePackage, restorePurchases, mapEntitlementToTier, syncTierToSupabase } from '@/services/subscription';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';

type BillingCycle = 'monthly' | 'annual';

interface TierInfo {
  entitlement: string;
  label: string;
  monthlyPrice: string;
  annualPrice: string;
  annualMonthly: string;
  savingsPct: number;
  features: string[];
  color: string;
  highlight?: boolean;
}

const TIERS: TierInfo[] = [
  {
    entitlement: 'hobbyist',
    label: 'Hobbyist',
    monthlyPrice: '49 kr/mnd',
    annualPrice: '399 kr/år',
    annualMonthly: '33 kr/mnd',
    savingsPct: 33,
    color: Colors.honey,
    highlight: true,
    features: [
      'Ubegrenset antall kuber',
      'AI varroaanalyse fra foto (10/mnd)',
      'Høstlogging og statistikk',
      'Inspeksjonsbasert prognose',
    ],
  },
  {
    entitlement: 'profesjonell',
    label: 'Profesjonell',
    monthlyPrice: '149 kr/mnd',
    annualPrice: '1 190 kr/år',
    annualMonthly: '99 kr/mnd',
    savingsPct: 33,
    color: Colors.success,
    features: [
      'Alt i Hobbyist',
      'AI varroa — ubegrenset',
      'Full CSV/PDF-eksport',
      'Prioritert support',
    ],
  },
  {
    entitlement: 'lag',
    label: 'Lag',
    monthlyPrice: '499 kr/mnd',
    annualPrice: '3 990 kr/år',
    annualMonthly: '333 kr/mnd',
    savingsPct: 33,
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
  title?: string;
  subtitle?: string;
}

export function UpgradeModal({ visible, onClose, title, subtitle }: UpgradeModalProps) {
  const { profile, setProfile } = useAuthStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>('annual');

  const { data: packages = [] } = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: fetchOfferings,
    enabled: visible,
  });

  const handlePurchase = async (entitlement: string) => {
    const annualKeywords = ['annual', 'yearly', 'year'];
    const monthlyKeywords = ['monthly', 'month'];
    const cycleWords = cycle === 'annual' ? annualKeywords : monthlyKeywords;

    // Prefer cycle-specific package; fall back to any matching entitlement
    const pkg =
      packages.find((p) =>
        (p.product.identifier.includes(entitlement) ||
          (p.offeringIdentifier ?? '').includes(entitlement)) &&
        cycleWords.some(
          (w) =>
            p.product.identifier.includes(w) ||
            (p.offeringIdentifier ?? '').includes(w),
        ),
      ) ??
      packages.find(
        (p) =>
          p.product.identifier.includes(entitlement) ||
          (p.offeringIdentifier ?? '').includes(entitlement),
      );

    if (!pkg) {
      Alert.alert(
        'Produkt ikke tilgjengelig',
        'Abonnementet er ikke konfigurert ennå. Prøv igjen senere.',
      );
      return;
    }

    setPurchasing(entitlement);
    try {
      const info = await purchasePackage(pkg);
      const tier = mapEntitlementToTier(info);
      await syncTierToSupabase(tier).catch((e) => Sentry.captureException(e));
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
      await syncTierToSupabase(tier).catch((e) => Sentry.captureException(e));
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
          <Text style={styles.title}>{title ?? 'Velg abonnement'}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Lukk">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        {subtitle && (
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        )}

        {/* Billing toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            <Pressable
              style={[styles.toggleBtn, cycle === 'monthly' && styles.toggleBtnActive]}
              onPress={() => setCycle('monthly')}
            >
              <Text style={[styles.toggleBtnText, cycle === 'monthly' && styles.toggleBtnTextActive]}>
                Månedlig
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, cycle === 'annual' && styles.toggleBtnActive]}
              onPress={() => setCycle('annual')}
            >
              <Text style={[styles.toggleBtnText, cycle === 'annual' && styles.toggleBtnTextActive]}>
                Årlig
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Spar 3 mnd</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.roiBanner}>
          <Text style={styles.roiText}>
            💡 Tidlig oppdagelse av varroa kan redde en bikube verdt 3 000–8 000 kr
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {TIERS.map((tier) => (
            <View
              key={tier.entitlement}
              style={[styles.tierCard, tier.highlight && styles.tierCardHighlight]}
            >
              {tier.highlight && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Mest populær</Text>
                </View>
              )}
              <View style={styles.tierHeader}>
                <Text style={styles.tierLabel}>{tier.label}</Text>
                <View style={styles.priceCol}>
                  <Text style={[styles.tierPrice, { color: tier.color }]}>
                    {cycle === 'annual' ? tier.annualPrice : tier.monthlyPrice}
                  </Text>
                  {cycle === 'annual' && (
                    <Text style={styles.tierPriceSub}>{tier.annualMonthly} fakturert årlig</Text>
                  )}
                </View>
              </View>
              <View style={styles.featureList}>
                {tier.features.map((f) => (
                  <Text key={f} style={styles.feature}>✓  {f}</Text>
                ))}
              </View>
              <Pressable
                style={[
                  styles.buyBtn,
                  { backgroundColor: tier.highlight ? tier.color : Colors.dark },
                  !!purchasing && styles.buyBtnDisabled,
                ]}
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

          {Platform.OS === 'android' && (
            <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={!!purchasing}>
              {purchasing === 'restore' ? (
                <ActivityIndicator color={Colors.mid} size="small" />
              ) : (
                <Text style={styles.restoreText}>Gjenopprett tidligere kjøp</Text>
              )}
            </Pressable>
          )}

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

  toggleWrap: { alignItems: 'center', paddingVertical: 16 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.mid + '18',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  toggleBtnActive: { backgroundColor: Colors.white, ...Shadows.light },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: Colors.mid },
  toggleBtnTextActive: { color: Colors.dark },
  saveBadge: {
    backgroundColor: Colors.honey + '22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.honeyDark },

  content: { padding: 20, gap: 16, paddingBottom: 40 },

  tierCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    ...Shadows.card,
  },
  tierCardHighlight: {
    borderWidth: 2,
    borderColor: Colors.honey,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.honey + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  popularBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.honeyDark },

  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tierLabel: { fontSize: 18, fontWeight: '800', color: Colors.dark },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  tierPrice: { fontSize: 16, fontWeight: '700' },
  tierPriceSub: { fontSize: 11, color: Colors.mid },

  featureList: { gap: 6 },
  feature: { fontSize: 14, color: Colors.mid },

  buyBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnDisabled: { opacity: 0.6 },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  roiBanner: {
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: Colors.honeyWash,
    borderRadius: 12,
    padding: 12,
  },
  roiText: { fontSize: 13, color: Colors.dark, lineHeight: 18, textAlign: 'center' },

  restoreBtn: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 14, color: Colors.mid },
  legal: { fontSize: 11, color: Colors.mid + 'AA', textAlign: 'center', lineHeight: 16 },
  subtitleWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mid,
    textAlign: 'center',
    lineHeight: 20,
  },
});
