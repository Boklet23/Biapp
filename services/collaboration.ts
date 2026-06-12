import { supabase } from '@/lib/supabase';

export interface Collaborator {
  id: string;
  hiveId: string;
  collaboratorId: string;
  collaboratorEmail: string;
  collaboratorName: string | null;
  invitedAt: string;
}

// E-post bor i auth.users (profiles har ingen email-kolonne), og RLS hindrer
// lesing av andres profiler. Begge operasjonene går derfor via SECURITY
// DEFINER-RPC-er (migrasjon 0050) med eksplisitt tilgangskontroll.

export async function fetchCollaborators(hiveId: string): Promise<Collaborator[]> {
  const { data, error } = await supabase.rpc('get_hive_collaborators', {
    p_hive_id: hiveId,
  });

  if (error) throw error;

  return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: typeof row.id === 'string' ? row.id : '',
    hiveId: typeof row.hive_id === 'string' ? row.hive_id : '',
    collaboratorId: typeof row.collaborator_id === 'string' ? row.collaborator_id : '',
    collaboratorEmail: typeof row.email === 'string' ? row.email : '',
    collaboratorName: typeof row.display_name === 'string' ? row.display_name : null,
    invitedAt: typeof row.invited_at === 'string' ? row.invited_at : '',
  }));
}

export async function addCollaboratorByEmail(hiveId: string, email: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data: targetId, error: lookupError } = await supabase.rpc(
    'lookup_user_id_by_email',
    { p_email: email },
  );

  // RPC-en kaster norske feilmeldinger (f.eks. «Kubedeling krever Lag-abonnement»)
  if (lookupError) throw new Error(lookupError.message);

  if (typeof targetId !== 'string') {
    throw new Error('Fant ingen bruker med den e-postadressen. De må registrere seg i BiVokter først.');
  }

  if (targetId === session.user.id) {
    throw new Error('Du kan ikke legge til deg selv som samarbeidspartner.');
  }

  const { error } = await supabase.from('hive_collaborators').insert({
    hive_id: hiveId,
    owner_id: session.user.id,
    collaborator_id: targetId,
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
