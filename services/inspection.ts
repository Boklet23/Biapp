import { supabase } from '@/lib/supabase';
import { Inspection } from '@/types';

export interface CreateInspectionData {
  hiveId: string;
  inspectedAt: string;
  weatherTemp?: number;
  weatherCondition?: string;
  numFramesBrood?: number;
  numFramesHoney?: number;
  numFramesEmpty?: number;
  queenSeen: boolean;
  queenCellsFound: boolean;
  varroaCount?: number;
  varroaMethod?: string;
  diseaseObservations?: Record<string, boolean>;
  treatmentApplied: boolean;
  treatmentProduct?: string;
  notes?: string;
  moodScore?: number;
}

export async function fetchInspections(hiveId: string): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('hive_id', hiveId)
    .order('inspected_at', { ascending: false });

  if (error) throw error;
  return data.map(mapInspection);
}

/** Fetch only the latest inspection per hive — fast, minimal payload, used for home screen UI. */
export async function fetchLastInspectionPerHive(): Promise<Record<string, Inspection>> {
  const { data, error } = await supabase
    .from('inspections')
    .select('id, hive_id, user_id, inspected_at, varroa_count, queen_seen, queen_cells_found, mood_score')
    .order('inspected_at', { ascending: false });

  if (error) throw error;

  const map: Record<string, Inspection> = {};
  for (const row of data as Record<string, unknown>[]) {
    const hiveId = row.hive_id as string;
    if (!map[hiveId]) {
      map[hiveId] = mapInspection(row);
    }
  }
  return map;
}

export async function fetchAllInspections(): Promise<Inspection[]> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .gte('inspected_at', oneYearAgo.toISOString())
    .order('inspected_at', { ascending: false })
    .limit(500);

  if (error) throw error;
  return data.map(mapInspection);
}

export async function fetchInspection(id: string): Promise<Inspection> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapInspection(data);
}

export async function createInspection(input: CreateInspectionData): Promise<Inspection> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('inspections')
    .insert({
      hive_id: input.hiveId,
      user_id: session.user.id,
      inspected_at: input.inspectedAt,
      weather_temp: input.weatherTemp ?? null,
      weather_condition: input.weatherCondition ?? null,
      num_frames_brood: input.numFramesBrood ?? null,
      num_frames_honey: input.numFramesHoney ?? null,
      num_frames_empty: input.numFramesEmpty ?? null,
      queen_seen: input.queenSeen,
      queen_cells_found: input.queenCellsFound,
      varroa_count: input.varroaCount ?? null,
      varroa_method: input.varroaMethod ?? null,
      disease_observations: input.diseaseObservations ?? null,
      treatment_applied: input.treatmentApplied,
      treatment_product: input.treatmentProduct ?? null,
      notes: input.notes ?? null,
      mood_score: input.moodScore ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInspection(data);
}

function mapInspection(row: Record<string, unknown>): Inspection {
  if (typeof row.id !== 'string') throw new Error('Ugyldig inspeksjon: mangler id');
  if (typeof row.hive_id !== 'string') throw new Error('Ugyldig inspeksjon: mangler hive_id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig inspeksjon: mangler user_id');
  if (typeof row.inspected_at !== 'string') throw new Error('Ugyldig inspeksjon: mangler inspected_at');
  return {
    id: row.id,
    hiveId: row.hive_id,
    userId: row.user_id,
    inspectedAt: row.inspected_at,
    weatherTemp: typeof row.weather_temp === 'number' ? row.weather_temp : null,
    weatherCondition: typeof row.weather_condition === 'string' ? row.weather_condition : null,
    numFramesBrood: typeof row.num_frames_brood === 'number' ? row.num_frames_brood : null,
    numFramesHoney: typeof row.num_frames_honey === 'number' ? row.num_frames_honey : null,
    numFramesEmpty: typeof row.num_frames_empty === 'number' ? row.num_frames_empty : null,
    queenSeen: row.queen_seen === true,
    queenCellsFound: row.queen_cells_found === true,
    varroaCount: typeof row.varroa_count === 'number' ? row.varroa_count : null,
    varroaMethod: typeof row.varroa_method === 'string' ? row.varroa_method : null,
    diseaseObservations: row.disease_observations != null ? row.disease_observations as Record<string, unknown> : null,
    treatmentApplied: row.treatment_applied === true,
    treatmentProduct: typeof row.treatment_product === 'string' ? row.treatment_product : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    moodScore: typeof row.mood_score === 'number' ? row.mood_score : null,
  };
}
