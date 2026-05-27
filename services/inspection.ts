import * as FileSystem from 'expo-file-system/legacy';
import { FileSystemUploadType } from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { Inspection, VarroaAnalysis } from '@/types';

const VALID_SEVERITIES = ['none', 'low', 'medium', 'high'] as const;
type ValidSeverity = typeof VALID_SEVERITIES[number];
function isValidSeverity(v: unknown): v is ValidSeverity {
  return VALID_SEVERITIES.includes(v as ValidSeverity);
}

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
  varroaAiCount?: number;
  varroaAiSeverity?: 'none' | 'low' | 'medium' | 'high';
  varroaAiRecommendation?: string;
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
    .order('inspected_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return data.map(mapInspection);
}

/** Fetch only the latest inspection per hive — uses DB DISTINCT ON for correctness at scale. */
export async function fetchLastInspectionPerHive(): Promise<Record<string, Inspection>> {
  const { data, error } = await supabase.rpc('get_latest_inspections_per_hive');

  if (error) throw error;

  const map: Record<string, Inspection> = {};
  for (const row of data as Record<string, unknown>[]) {
    map[row.hive_id as string] = mapInspection(row);
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
      varroa_ai_count: input.varroaAiCount ?? null,
      varroa_ai_severity: input.varroaAiSeverity ?? null,
      varroa_ai_recommendation: input.varroaAiRecommendation ?? null,
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

export async function uploadInspectionPhoto(
  localUri: string,
  inspectionId: string,
  userId: string,
  accessToken: string,
): Promise<string> {
  let uploadUri = localUri;
  if (localUri.startsWith('content://')) {
    const srcExt = localUri.split('.').pop()?.toLowerCase();
    const tmpExt = srcExt && ['jpg', 'jpeg', 'png'].includes(srcExt) ? srcExt : 'jpg';
    const tmp = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ''}insp_${Date.now()}.${tmpExt}`;
    await FileSystem.copyAsync({ from: localUri, to: tmp });
    uploadUri = tmp;
  }

  const ext = uploadUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png'].includes(ext) ? ext : 'jpg';
  const contentType = safeExt === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = `${userId}/${inspectionId}/${Date.now()}.${safeExt}`;
  const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/inspection-media/${fileName}`;

  const response = await FileSystem.uploadAsync(uploadUrl, uploadUri, {
    httpMethod: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    uploadType: FileSystemUploadType.BINARY_CONTENT,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Bildeoppasting feilet (HTTP ${response.status})`);
  }

  return fileName;
}

export async function createInspectionMedia(inspectionId: string, storagePath: string): Promise<void> {
  const { error } = await supabase
    .from('inspection_media')
    .insert({ inspection_id: inspectionId, storage_path: storagePath, media_type: 'image' });
  if (error) throw error;
}

export async function fetchInspectionMedia(inspectionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('inspection_media')
    .select('storage_path')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const paths = (data ?? []).map((row) => row.storage_path as string);
  if (paths.length === 0) return [];

  const { data: signed, error: signedError } = await supabase.storage
    .from('inspection-media')
    .createSignedUrls(paths, 3600);

  if (signedError) throw signedError;
  return (signed ?? []).map(d => d.signedUrl).filter((u): u is string => !!u);
}

export async function deleteInspectionMedia(id: string): Promise<void> {
  const { error } = await supabase.from('inspection_media').delete().eq('id', id);
  if (error) throw error;
}

export async function analyzeVarroa(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<VarroaAnalysis> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Ikke innlogget');

  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-varroa`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64, mediaType }),
  });

  const data = await res.json() as VarroaAnalysis & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Analyse feilet');
  return data;
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
    varroaAiCount: typeof row.varroa_ai_count === 'number' ? row.varroa_ai_count : null,
    varroaAiSeverity: isValidSeverity(row.varroa_ai_severity) ? row.varroa_ai_severity : null,
    varroaAiRecommendation: typeof row.varroa_ai_recommendation === 'string' ? row.varroa_ai_recommendation : null,
    diseaseObservations: row.disease_observations != null ? row.disease_observations as Record<string, unknown> : null,
    treatmentApplied: row.treatment_applied === true,
    treatmentProduct: typeof row.treatment_product === 'string' ? row.treatment_product : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    moodScore: typeof row.mood_score === 'number' ? row.mood_score : null,
  };
}
