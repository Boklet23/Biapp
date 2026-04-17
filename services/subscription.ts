import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
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
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey: ANDROID_KEY, appUserID: userId });
  return Purchases.getCustomerInfo();
}

/** Hent oppdatert CustomerInfo uten å re-initialisere. */
export async function getCustomerInfo(): Promise<CustomerInfo> {
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
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/** Gjenopprett tidligere kjøp (f.eks. etter reinstallasjon). */
export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Hent tilgjengelige pakker fra RevenueCat Offerings. */
export async function fetchOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Oppdater subscription_tier i Supabase etter et kjøp. */
export async function syncTierToSupabase(tier: SubscriptionTier): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!user) return;

  await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', session.user.id);
}
