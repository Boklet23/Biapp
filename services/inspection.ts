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

export async function fetchAllInspections(): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('inspected_at', { ascending: false });

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('inspections')
    .insert({
      hive_id: input.hiveId,
      user_id: user.id,
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
  return {
    id: row.id as string,
    hiveId: row.hive_id as string,
    userId: row.user_id as string,
    inspectedAt: row.inspected_at as string,
    weatherTemp: row.weather_temp as number | null,
    weatherCondition: row.weather_condition as string | null,
    numFramesBrood: row.num_frames_brood as number | null,
    numFramesHoney: row.num_frames_honey as number | null,
    numFramesEmpty: row.num_frames_empty as number | null,
    queenSeen: row.queen_seen as boolean,
    queenCellsFound: row.queen_cells_found as boolean,
    varroaCount: row.varroa_count as number | null,
    varroaMethod: row.varroa_method as string | null,
    diseaseObservations: row.disease_observations as Record<string, unknown> | null,
    treatmentApplied: row.treatment_applied as boolean,
    treatmentProduct: row.treatment_product as string | null,
    notes: row.notes as string | null,
    moodScore: row.mood_score as number | null,
  };
}
