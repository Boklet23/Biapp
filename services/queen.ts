import { supabase } from '@/lib/supabase';
import { Queen } from '@/types';

function mapQueen(row: Record<string, unknown>): Queen {
  if (typeof row.id !== 'string') throw new Error('Ugyldig dronning: mangler id');
  if (typeof row.hive_id !== 'string') throw new Error('Ugyldig dronning: mangler hive_id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig dronning: mangler user_id');
  if (typeof row.introduced_at !== 'string') throw new Error('Ugyldig dronning: mangler introduced_at');
  return {
    id: row.id,
    hiveId: row.hive_id,
    userId: row.user_id,
    introducedAt: row.introduced_at,
    replacedAt: typeof row.replaced_at === 'string' ? row.replaced_at : null,
    origin: typeof row.origin === 'string' ? row.origin : null,
    breed: typeof row.breed === 'string' ? row.breed : null,
    markedColor: typeof row.marked_color === 'string' ? row.marked_color : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.id,
  };
}

export async function fetchQueens(hiveId: string): Promise<Queen[]> {
  const { data, error } = await supabase
    .from('queens')
    .select('*')
    .eq('hive_id', hiveId)
    .order('introduced_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[]).map(mapQueen);
}

export interface CreateQueenInput {
  hiveId: string;
  introducedAt: string;
  replacedAt?: string;
  origin?: string;
  breed?: string;
  markedColor?: string;
  notes?: string;
}

export async function createQueen(input: CreateQueenInput): Promise<Queen> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('queens')
    .insert({
      hive_id: input.hiveId,
      user_id: session.user.id,
      introduced_at: input.introducedAt,
      replaced_at: input.replacedAt ?? null,
      origin: input.origin ?? null,
      breed: input.breed ?? null,
      marked_color: input.markedColor ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapQueen(data as Record<string, unknown>);
}

export async function updateQueenReplaced(id: string, replacedAt: string): Promise<void> {
  const { error } = await supabase
    .from('queens')
    .update({ replaced_at: replacedAt })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteQueen(id: string): Promise<void> {
  const { error } = await supabase.from('queens').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
