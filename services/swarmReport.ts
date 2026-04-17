import { supabase } from '@/lib/supabase';

export interface SwarmReport {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  description: string | null;
  contactInfo: string | null;
  status: 'open' | 'resolved';
  reportedAt: string;
}

export interface CreateSwarmReportData {
  lat: number;
  lng: number;
  description?: string;
  contactInfo?: string;
}

function mapReport(row: Record<string, unknown>): SwarmReport {
  if (typeof row.id !== 'string') throw new Error('Ugyldig svermrapport: mangler id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig svermrapport: mangler user_id');
  if (typeof row.lat !== 'number') throw new Error('Ugyldig svermrapport: mangler lat');
  if (typeof row.lng !== 'number') throw new Error('Ugyldig svermrapport: mangler lng');
  if (typeof row.reported_at !== 'string') throw new Error('Ugyldig svermrapport: mangler reported_at');
  return {
    id: row.id,
    userId: row.user_id,
    lat: row.lat,
    lng: row.lng,
    description: typeof row.description === 'string' ? row.description : null,
    contactInfo: typeof row.contact_info === 'string' ? row.contact_info : null,
    status: row.status as 'open' | 'resolved',
    reportedAt: row.reported_at,
  };
}

export async function fetchSwarmReports(): Promise<SwarmReport[]> {
  const { data, error } = await supabase
    .from('swarm_reports')
    .select('*')
    .eq('status', 'open')
    .order('reported_at', { ascending: false });

  if (error) throw error;
  return data.map(mapReport);
}

export async function createSwarmReport(input: CreateSwarmReportData): Promise<SwarmReport> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('swarm_reports')
    .insert({
      user_id: session.user.id,
      lat: input.lat,
      lng: input.lng,
      description: input.description ?? null,
      contact_info: input.contactInfo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapReport(data);
}

export async function resolveSwarmReport(id: string): Promise<void> {
  const { error } = await supabase
    .from('swarm_reports')
    .update({ status: 'resolved' })
    .eq('id', id);

  if (error) throw error;
}
