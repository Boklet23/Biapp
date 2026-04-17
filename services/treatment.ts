import { supabase } from '@/lib/supabase';
import { Treatment } from '@/types';

export interface CreateTreatmentData {
  hiveId: string;
  treatedAt: string; // 'YYYY-MM-DD'
  product: string;
  dose?: string;
  method?: string;
  notes?: string;
}

export async function fetchAllTreatments(): Promise<Treatment[]> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2);

  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .gte('treated_at', oneYearAgo.toISOString().split('T')[0])
    .order('treated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapTreatment);
}

export async function fetchTreatments(hiveId: string): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('hive_id', hiveId)
    .order('treated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapTreatment);
}

export async function createTreatment(input: CreateTreatmentData): Promise<Treatment> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('treatments')
    .insert({
      hive_id: input.hiveId,
      user_id: session.user.id,
      treated_at: input.treatedAt,
      product: input.product,
      dose: input.dose ?? null,
      method: input.method ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTreatment(data);
}

export async function deleteTreatment(id: string): Promise<void> {
  const { error } = await supabase.from('treatments').delete().eq('id', id);
  if (error) throw error;
}

function mapTreatment(row: Record<string, unknown>): Treatment {
  if (typeof row.id !== 'string') throw new Error('Ugyldig behandling: mangler id');
  if (typeof row.hive_id !== 'string') throw new Error('Ugyldig behandling: mangler hive_id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig behandling: mangler user_id');
  if (typeof row.treated_at !== 'string') throw new Error('Ugyldig behandling: mangler treated_at');
  if (typeof row.product !== 'string') throw new Error('Ugyldig behandling: mangler product');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig behandling: mangler created_at');
  return {
    id: row.id,
    hiveId: row.hive_id,
    userId: row.user_id,
    treatedAt: row.treated_at,
    product: row.product,
    dose: typeof row.dose === 'string' ? row.dose : null,
    method: typeof row.method === 'string' ? row.method : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    createdAt: row.created_at,
  };
}
