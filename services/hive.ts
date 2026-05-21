import * as FileSystem from 'expo-file-system/legacy';
import { FileSystemUploadType } from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { BeeBreed, Hive, HiveType, MapHiveEntry } from '@/types';

const VALID_HIVE_TYPES: HiveType[] = ['langstroth', 'warre', 'toppstang', 'annet'];
const VALID_BEE_BREEDS: BeeBreed[] = ['norsk_landbee', 'buckfast', 'carniolan', 'annet'];

export interface CreateHiveData {
  name: string;
  type: HiveType;
  beeBreed?: BeeBreed;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
  photoUrl?: string;
  numBoxes?: number;
  framesPerBox?: number;
}

export async function normalizePhotoUri(uri: string): Promise<string> {
  if (uri.startsWith('file://')) return uri;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const safeExt = ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDir) throw new Error('Filsystem ikke tilgjengelig');
  const dest = `${cacheDir}photo_preview_${Date.now()}.${safeExt}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
  } catch {
    throw new Error('Kunne ikke lese bildet fra kameraet');
  }
  return dest;
}

export async function uploadHivePhoto(
  localUri: string,
  userId: string,
  accessToken: string,
): Promise<string> {
  // Android gallery can return content:// URIs — FileSystem.uploadAsync requires file://
  let uploadUri = localUri;
  if (localUri.startsWith('content://')) {
    const srcExt = localUri.split('.').pop()?.toLowerCase();
    const tmpExt = srcExt && ['jpg', 'jpeg', 'png'].includes(srcExt) ? srcExt : 'jpg';
    const tmp = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ''}hive_upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${tmpExt}`;
    await FileSystem.copyAsync({ from: localUri, to: tmp });
    uploadUri = tmp;
  }

  const ext = uploadUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png'].includes(ext) ? ext : 'jpg';
  const contentType = safeExt === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = `${userId}/${Date.now()}.${safeExt}`;

  const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/hive-photos/${fileName}`;

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
    throw new Error(`Opplasting feilet (HTTP ${response.status}): ${response.body}`);
  }

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
      num_boxes: input.numBoxes ?? 1,
      frames_per_box: input.framesPerBox ?? 10,
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
  if (input.numBoxes !== undefined) patch.num_boxes = input.numBoxes;
  if (input.framesPerBox !== undefined) patch.frames_per_box = input.framesPerBox;
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

export async function fetchMapHives(): Promise<MapHiveEntry[]> {
  const { data, error } = await supabase.rpc('get_map_hives');
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    type: row.type as HiveType,
    locationLat: row.location_lat as number,
    locationLng: row.location_lng as number,
    locationName: typeof row.location_name === 'string' ? row.location_name : null,
    ownerId: row.owner_id as string,
    ownerName: row.owner_name as string,
    relationship: row.relationship as MapHiveEntry['relationship'],
  }));
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
  const rawType = row.type as string;
  const type: HiveType = VALID_HIVE_TYPES.includes(rawType as HiveType) ? (rawType as HiveType) : 'annet';
  const rawBreed = typeof row.bee_breed === 'string' ? row.bee_breed : null;
  const beeBreed: BeeBreed | null = rawBreed && VALID_BEE_BREEDS.includes(rawBreed as BeeBreed) ? (rawBreed as BeeBreed) : null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type,
    beeBreed,
    locationLat: typeof row.location_lat === 'number' ? row.location_lat : null,
    locationLng: typeof row.location_lng === 'number' ? row.location_lng : null,
    locationName: typeof row.location_name === 'string' ? row.location_name : null,
    isActive: row.is_active === true,
    notes: typeof row.notes === 'string' ? row.notes : null,
    photoUrl: typeof row.photo_url === 'string' ? row.photo_url : null,
    numBoxes: typeof row.num_boxes === 'number' ? row.num_boxes : null,
    framesPerBox: typeof row.frames_per_box === 'number' ? row.frames_per_box : null,
    createdAt: row.created_at,
  };
}
