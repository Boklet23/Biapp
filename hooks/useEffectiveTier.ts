import { useAuthStore } from '@/store/auth';
import type { SubscriptionTier } from '@/types';

const TIER_RANK: Record<SubscriptionTier, number> = {
  starter: 0,
  hobbyist: 1,
  profesjonell: 2,
  lag: 3,
};

/** True if `tier` is at least `min` in the subscription hierarchy. */
export function tierAtLeast(tier: SubscriptionTier, min: SubscriptionTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[min];
}

/**
 * Returns the user's active tier: the highest of DB tier (webhook-owned),
 * local RevenueCat entitlement tier, and active free trial (= hobbyist).
 * RC-tieren dekker vinduet mellom kjøp og webhook-sync, og transient
 * profil-hentefeil ved kald start.
 */
export function useEffectiveTier(): SubscriptionTier {
  const profile = useAuthStore((s) => s.profile);
  const rcTier = useAuthStore((s) => s.rcTier);

  const candidates: SubscriptionTier[] = [profile?.subscriptionTier ?? 'starter'];
  if (rcTier) candidates.push(rcTier);
  if (profile?.trialExpiresAt && new Date(profile.trialExpiresAt) > new Date()) {
    candidates.push('hobbyist');
  }
  return candidates.reduce((best, t) => (TIER_RANK[t] > TIER_RANK[best] ? t : best));
}

/** Days left in free trial, or null if no active trial. */
export function useTrialDaysLeft(): number | null {
  const profile = useAuthStore((s) => s.profile);
  if (!profile?.trialExpiresAt || profile.subscriptionTier !== 'starter') return null;
  const days = Math.ceil(
    (new Date(profile.trialExpiresAt).getTime() - Date.now()) / 86_400_000,
  );
  return days > 0 ? days : null;
}
