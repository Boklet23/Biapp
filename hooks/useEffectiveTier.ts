import { useAuthStore } from '@/store/auth';
import type { SubscriptionTier } from '@/types';

/** Returns the user's active tier, accounting for active free trial. */
export function useEffectiveTier(): SubscriptionTier {
  const profile = useAuthStore((s) => s.profile);
  if (!profile) return 'starter';
  if (profile.subscriptionTier !== 'starter') return profile.subscriptionTier;
  if (profile.trialExpiresAt && new Date(profile.trialExpiresAt) > new Date()) {
    return 'hobbyist';
  }
  return 'starter';
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
