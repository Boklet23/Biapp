import { supabase } from '@/lib/supabase';
import { ExperienceLevel, SubscriptionTier, User } from '@/types';

function mapProfile(row: Record<string, unknown>): User {
  if (typeof row.id !== 'string') throw new Error('Ugyldig profil: mangler id');
  if (typeof row.email !== 'string') throw new Error('Ugyldig profil: mangler email');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig profil: mangler created_at');
  return {
    id: row.id,
    email: row.email,
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
    municipalityId: typeof row.municipality_id === 'number' ? row.municipality_id : null,
    experienceLevel: (row.experience_level as ExperienceLevel | null) ?? null,
    subscriptionTier: (row.subscription_tier as SubscriptionTier) ?? 'starter',
    trialExpiresAt: typeof row.trial_expires_at === 'string' ? row.trial_expires_at : null,
    teamId: typeof row.team_id === 'string' ? row.team_id : null,
    createdAt: row.created_at,
  };
}

/**
 * Henter profilen for innlogget bruker. Returnerer null kun når ingen er
 * innlogget; nettverks-/DB-feil kastes videre etter retry slik at kalleren
 * kan skille «ikke innlogget» fra «transient feil» (og ikke stille
 * nedgradere en betalende bruker til starter).
 */
export async function fetchProfile(retries = 2): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error) return mapProfile({ ...data, email: session.user.email ?? '' });
    lastError = error;
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

export interface UpdateProfileData {
  displayName?: string;
  experienceLevel?: ExperienceLevel | null;
}

export async function updateProfile(data: UpdateProfileData): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.displayName,
      experience_level: data.experienceLevel,
    })
    .eq('id', session.user.id);

  if (error) throw error;
}
