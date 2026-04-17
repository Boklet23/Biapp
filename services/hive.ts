import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { BeeBreed, Hive, HiveType } from '@/types';

export interface CreateHiveData {
  name: string;
  type: HiveType;
  beeBreed?: BeeBreed;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
  photoUrl?: string;
}

/**
 * Last opp et lokalt bilde til Supabase Storage (hive-photos-bucket).
 * Returnerer public URL som kan lagres i hives.photo_url.
 */
export async function uploadHivePhoto(localUri: string, userId: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png'].includes(ext) ? ext : 'jpg';
  const contentType = safeExt === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = `${userId}/${Date.now()}.${safeExt}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });

  const binaryString = atob(base64);
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from('hive-photos')
    .upload(fileName, bytes, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('hive-photos').getPublicUrl(fileName);
  return data.publicUrl;
}

export interface UpdateHiveData extends Partial<CreateHiveData> {
  isActive?: boolean;
}

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchHives(): Promise<Hive[]> {
  const query = supabase
    .from('hives')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Tidsavbrudd – prøv igjen')), FETCH_TIMEOUT_MS)
  );

  const { data, error } = await Promise.race([query, timeout]) as Awaited<typeof query>;
  if (error) throw error;
  return data.map(mapHive);
}

export async function fetchHive(id: string): Promise<Hive> {
  const { data, error } = await supabase
    .from('hives')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapHive(data);
}

export async function createHive(input: CreateHiveData): Promise<Hive> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('hives')
    .insert({
      user_id: session.user.id,
      name: input.name,
      type: input.type,
      bee_breed: input.beeBreed ?? null,
      location_name: input.locationName ?? null,
      location_lat: input.locationLat ?? null,
      location_lng: input.locationLng ?? null,
      notes: input.notes ?? null,
      ...(input.photoUrl !== undefined ? { photo_url: input.photoUrl } : {}),
    })
    .select()
    .single();

  if (error) throw error;
  return mapHive(data);
}

export async function updateHive(id: string, input: UpdateHiveData): Promise<Hive> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.type !== undefined) patch.type = input.type;
  if (input.beeBreed !== undefined) patch.bee_breed = input.beeBreed;
  if (input.locationName !== undefined) patch.location_name = input.locationName;
  if (input.locationLat !== undefined) patch.location_lat = input.locationLat;
  if (input.locationLng !== undefined) patch.location_lng = input.locationLng;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.photoUrl !== undefined) patch.photo_url = input.photoUrl;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const { data, error } = await supabase
    .from('hives')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapHive(data);
}

export async function deleteHive(id: string): Promise<void> {
  const { error } = await supabase
    .from('hives')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

function mapHive(row: Record<string, unknown>): Hive {
  if (typeof row.id !== 'string') throw new Error('Ugyldig hive: mangler id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig hive: mangler user_id');
  if (typeof row.name !== 'string') throw new Error('Ugyldig hive: mangler name');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig hive: mangler created_at');
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type as HiveType,
    beeBreed: typeof row.bee_breed === 'string' ? row.bee_breed as BeeBreed : null,
    locationLat: typeof row.location_lat === 'number' ? row.location_lat : null,
    locationLng: typeof row.location_lng === 'number' ? row.location_lng : null,
    locationName: typeof row.location_name === 'string' ? row.location_name : null,
    isActive: row.is_active === true,
    notes: typeof row.notes === 'string' ? row.notes : null,
    photoUrl: typeof row.photo_url === 'string' ? row.photo_url : null,
    createdAt: row.created_at,
  };
}
