import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { SubscriptionTier } from '@/types';

const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const isExpoGo = Constants.appOwnership === 'expo';

/** Initialiser RevenueCat og koble til bruker-ID. Returnerer CustomerInfo. */
export async function initPurchases(userId: string): Promise<CustomerInfo> {
  if (isExpoGo) {
    throw new Error('RevenueCat ikke tilgjengelig i Expo Go');
  }
  if (Platform.OS !== 'android') {
    // iOS: ikke konfigurert ennå — returner mock CustomerInfo med starter-tier
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  // Fail-fast: uten nøkkel ville configure() stille gi feil tier til betalende.
  if (!ANDROID_KEY) {
    throw new Error('RevenueCat Android-nøkkel mangler (EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ikke satt)');
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey: ANDROID_KEY, appUserID: userId });
  return Purchases.getCustomerInfo();
}

/** Hent oppdatert CustomerInfo uten å re-initialisere. */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (Platform.OS !== 'android') {
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  return Purchases.getCustomerInfo();
}

/** Oversett aktive RevenueCat-entitlements til intern SubscriptionTier. */
export function mapEntitlementToTier(customerInfo: CustomerInfo): SubscriptionTier {
  const active = customerInfo.entitlements.active;
  if (active['lag'])          return 'lag';
  if (active['profesjonell']) return 'profesjonell';
  if (active['hobbyist'])     return 'hobbyist';
  return 'starter';
}

/** Kjøp en pakke og returner oppdatert CustomerInfo. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  if (Platform.OS !== 'android') {
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/** Gjenopprett tidligere kjøp (f.eks. etter reinstallasjon). */
export async function restorePurchases(): Promise<CustomerInfo> {
  if (Platform.OS !== 'android') {
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  return Purchases.restorePurchases();
}

/** Hent tilgjengelige pakker fra RevenueCat Offerings. */
export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  if (Platform.OS !== 'android') return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/**
 * Registrer RevenueCat-tier i lokal auth-state. Klienten skriver IKKE
 * subscription_tier til Supabase — DB-tieren eies av RevenueCat-webhooken
 * (service_role), og profiles-kolonnen er låst for authenticated (migrasjon 0047).
 * useEffectiveTier() bruker høyeste av DB-tier, RC-tier og aktiv prøveperiode.
 */
export function applyCustomerInfo(info: CustomerInfo): SubscriptionTier {
  const tier = mapEntitlementToTier(info);
  useAuthStore.getState().setRcTier(tier);
  return tier;
}
