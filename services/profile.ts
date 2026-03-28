import { supabase } from '@/lib/supabase';
import { ExperienceLevel, SubscriptionTier, User } from '@/types';

function mapProfile(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    displayName: row.display_name as string | null,
    municipalityId: row.municipality_id as number | null,
    experienceLevel: row.experience_level as ExperienceLevel | null,
    subscriptionTier: (row.subscription_tier as SubscriptionTier) ?? 'starter',
    teamId: row.team_id as string | null,
    createdAt: row.created_at as string,
  };
}

export async function fetchProfile(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return mapProfile({ ...data, email: user.email ?? '' });
}

export interface UpdateProfileData {
  displayName?: string;
  experienceLevel?: ExperienceLevel | null;
}

export async function updateProfile(data: UpdateProfileData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.displayName,
      experience_level: data.experienceLevel,
    })
    .eq('id', user.id);

  if (error) throw error;
}
