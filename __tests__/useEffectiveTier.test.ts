import type { SubscriptionTier, User } from '@/types';

jest.mock('@/store/auth', () => ({
  useAuthStore: jest.fn(),
}));

import { useAuthStore } from '@/store/auth';
import { tierAtLeast, useEffectiveTier, useTrialDaysLeft } from '@/hooks/useEffectiveTier';

type StoreShape = { profile: Partial<User> | null; rcTier: SubscriptionTier | null };

function setStore(state: StoreShape) {
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: StoreShape) => unknown) => selector(state),
  );
}

const TIERS: SubscriptionTier[] = ['starter', 'hobbyist', 'profesjonell', 'lag'];

describe('tierAtLeast', () => {
  it('følger hierarkiet starter < hobbyist < profesjonell < lag', () => {
    for (let i = 0; i < TIERS.length; i++) {
      for (let j = 0; j < TIERS.length; j++) {
        expect(tierAtLeast(TIERS[i], TIERS[j])).toBe(i >= j);
      }
    }
  });
});

describe('useEffectiveTier (høyeste av DB-tier, RC-tier og aktiv prøveperiode)', () => {
  it('faller tilbake på starter uten profil og RC-tier', () => {
    setStore({ profile: null, rcTier: null });
    expect(useEffectiveTier()).toBe('starter');
  });

  it('nedgraderer ALDRI en betalende DB-tier pga. utdatert RC-tier', () => {
    setStore({ profile: { subscriptionTier: 'lag' }, rcTier: 'starter' });
    expect(useEffectiveTier()).toBe('lag');
  });

  it('bruker RC-tier i vinduet mellom kjøp og webhook-sync', () => {
    setStore({ profile: { subscriptionTier: 'starter' }, rcTier: 'profesjonell' });
    expect(useEffectiveTier()).toBe('profesjonell');
  });

  it('gir hobbyist ved aktiv prøveperiode', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    setStore({ profile: { subscriptionTier: 'starter', trialExpiresAt: tomorrow }, rcTier: null });
    expect(useEffectiveTier()).toBe('hobbyist');
  });

  it('gir INGEN prøvebonus når fristen akkurat er passert', () => {
    const justExpired = new Date(Date.now() - 1).toISOString();
    setStore({ profile: { subscriptionTier: 'starter', trialExpiresAt: justExpired }, rcTier: null });
    expect(useEffectiveTier()).toBe('starter');
  });

  it('lar prøveperiode aldri trumfe en høyere betalt tier', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    setStore({ profile: { subscriptionTier: 'profesjonell', trialExpiresAt: tomorrow }, rcTier: null });
    expect(useEffectiveTier()).toBe('profesjonell');
  });
});

describe('useTrialDaysLeft', () => {
  it('er null for oppgraderte brukere selv med fremtidig trial-dato (ingen stale banner)', () => {
    const future = new Date(Date.now() + 5 * 86_400_000).toISOString();
    setStore({ profile: { subscriptionTier: 'hobbyist', trialExpiresAt: future }, rcTier: null });
    expect(useTrialDaysLeft()).toBeNull();
  });

  it('runder opp til hele dager', () => {
    const in36h = new Date(Date.now() + 1.5 * 86_400_000).toISOString();
    setStore({ profile: { subscriptionTier: 'starter', trialExpiresAt: in36h }, rcTier: null });
    expect(useTrialDaysLeft()).toBe(2);
  });

  it('er null (ikke 0) når fristen er passert', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    setStore({ profile: { subscriptionTier: 'starter', trialExpiresAt: past }, rcTier: null });
    expect(useTrialDaysLeft()).toBeNull();
  });
});
