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
  return {
    id: row.id as string,
    userId: row.user_id as string,
    lat: row.lat as number,
    lng: row.lng as number,
    description: row.description as string | null,
    contactInfo: row.contact_info as string | null,
    status: row.status as 'open' | 'resolved',
    reportedAt: row.reported_at as string,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('swarm_reports')
    .insert({
      user_id: user.id,
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
