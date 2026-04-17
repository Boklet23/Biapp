import { supabase } from '@/lib/supabase';

export interface Collaborator {
  id: string;
  hiveId: string;
  collaboratorId: string;
  collaboratorEmail: string;
  collaboratorName: string | null;
  invitedAt: string;
}

export async function fetchCollaborators(hiveId: string): Promise<Collaborator[]> {
  const { data, error } = await supabase
    .from('hive_collaborators')
    .select(`
      id,
      hive_id,
      collaborator_id,
      invited_at,
      profiles!hive_collaborators_collaborator_id_fkey (
        email,
        display_name
      )
    `)
    .eq('hive_id', hiveId);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as Record<string, unknown> | null;
    return {
      id: typeof row.id === 'string' ? row.id : '',
      hiveId: typeof row.hive_id === 'string' ? row.hive_id : '',
      collaboratorId: typeof row.collaborator_id === 'string' ? row.collaborator_id : '',
      collaboratorEmail: typeof profile?.email === 'string' ? profile.email : '',
      collaboratorName: typeof profile?.display_name === 'string' ? profile.display_name : null,
      invitedAt: typeof row.invited_at === 'string' ? row.invited_at : '',
    };
  });
}

export async function addCollaboratorByEmail(hiveId: string, email: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  // Look up the user by email in profiles
  const { data: profiles, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (lookupError || !profiles) {
    throw new Error('Fant ingen bruker med den e-postadressen. De må registrere seg i BiVokter først.');
  }

  if (profiles.id === session.user.id) {
    throw new Error('Du kan ikke legge til deg selv som samarbeidspartner.');
  }

  const { error } = await supabase.from('hive_collaborators').insert({
    hive_id: hiveId,
    owner_id: session.user.id,
    collaborator_id: profiles.id,
  });

  if (error) {
    if (error.code === '23505') throw new Error('Denne personen er allerede lagt til.');
    throw error;
  }
}

export async function removeCollaborator(collaboratorId: string): Promise<void> {
  const { error } = await supabase.from('hive_collaborators').delete().eq('id', collaboratorId);
  if (error) throw error;
}
