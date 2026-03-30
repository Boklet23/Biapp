import { supabase } from '@/lib/supabase';
import { HarvestRecord } from '@/types';

export interface CreateHarvestData {
  hiveId: string;
  harvestedAt: string; // 'YYYY-MM-DD'
  quantityKg: number;
  notes?: string;
}

export async function fetchHarvests(): Promise<HarvestRecord[]> {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const { data, error } = await supabase
    .from('harvest_records')
    .select('*')
    .gte('harvested_at', twoYearsAgo.toISOString().split('T')[0])
    .order('harvested_at', { ascending: false });

  if (error) throw error;
  return data.map(mapHarvest);
}

export async function createHarvest(input: CreateHarvestData): Promise<HarvestRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('harvest_records')
    .insert({
      user_id: user.id,
      hive_id: input.hiveId,
      harvested_at: input.harvestedAt,
      quantity_kg: input.quantityKg,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapHarvest(data);
}

export async function deleteHarvest(id: string): Promise<void> {
  const { error } = await supabase
    .from('harvest_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function mapHarvest(row: Record<string, unknown>): HarvestRecord {
  if (typeof row.id !== 'string') throw new Error('Ugyldig høst: mangler id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig høst: mangler user_id');
  if (typeof row.hive_id !== 'string') throw new Error('Ugyldig høst: mangler hive_id');
  if (typeof row.harvested_at !== 'string') throw new Error('Ugyldig høst: mangler harvested_at');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig høst: mangler created_at');
  return {
    id: row.id,
    userId: row.user_id,
    hiveId: row.hive_id,
    harvestedAt: row.harvested_at,
    quantityKg: typeof row.quantity_kg === 'number' ? row.quantity_kg : parseFloat(String(row.quantity_kg)),
    notes: typeof row.notes === 'string' ? row.notes : null,
    createdAt: row.created_at,
  };
}
