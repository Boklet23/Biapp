import { supabase } from '@/lib/supabase';
import { Hive, HiveType } from '@/types';

export interface CreateHiveData {
  name: string;
  type: HiveType;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
}

export interface UpdateHiveData extends Partial<CreateHiveData> {
  isActive?: boolean;
}

export async function fetchHives(): Promise<Hive[]> {
  const { data, error } = await supabase
    .from('hives')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('hives')
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      location_name: input.locationName ?? null,
      location_lat: input.locationLat ?? null,
      location_lng: input.locationLng ?? null,
      notes: input.notes ?? null,
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
  if (input.locationName !== undefined) patch.location_name = input.locationName;
  if (input.locationLat !== undefined) patch.location_lat = input.locationLat;
  if (input.locationLng !== undefined) patch.location_lng = input.locationLng;
  if (input.notes !== undefined) patch.notes = input.notes;
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
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    type: row.type as HiveType,
    locationLat: row.location_lat as number | null,
    locationLng: row.location_lng as number | null,
    locationName: row.location_name as string | null,
    isActive: row.is_active as boolean,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  };
}
