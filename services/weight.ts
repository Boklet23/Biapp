import { supabase } from '@/lib/supabase';
import { HiveWeight } from '@/types';

export interface CreateWeightData {
  hiveId: string;
  weighedAt: string; // 'YYYY-MM-DD'
  weightKg: number;
  notes?: string;
}

export async function fetchWeights(hiveId: string): Promise<HiveWeight[]> {
  const { data, error } = await supabase
    .from('hive_weights')
    .select('*')
    .eq('hive_id', hiveId)
    .order('weighed_at', { ascending: false });

  if (error) throw error;
  return data.map(mapWeight);
}

export async function createWeight(input: CreateWeightData): Promise<HiveWeight> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('hive_weights')
    .insert({
      hive_id: input.hiveId,
      user_id: user.id,
      weighed_at: input.weighedAt,
      weight_kg: input.weightKg,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapWeight(data);
}

export async function deleteWeight(id: string): Promise<void> {
  const { error } = await supabase.from('hive_weights').delete().eq('id', id);
  if (error) throw error;
}

function mapWeight(row: Record<string, unknown>): HiveWeight {
  if (typeof row.id !== 'string') throw new Error('Ugyldig vekt: mangler id');
  if (typeof row.hive_id !== 'string') throw new Error('Ugyldig vekt: mangler hive_id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig vekt: mangler user_id');
  if (typeof row.weighed_at !== 'string') throw new Error('Ugyldig vekt: mangler weighed_at');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig vekt: mangler created_at');
  const raw = row.weight_kg;
  return {
    id: row.id,
    hiveId: row.hive_id,
    userId: row.user_id,
    weighedAt: row.weighed_at,
    weightKg: typeof raw === 'number' ? raw : parseFloat(String(raw)),
    notes: typeof row.notes === 'string' ? row.notes : null,
    createdAt: row.created_at,
  };
}
