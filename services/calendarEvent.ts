import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types';

export interface CreateCalendarEventData {
  title: string;
  eventDate: string; // 'YYYY-MM-DD'
  notes?: string;
  notificationId?: string;
}

function mapEvent(row: Record<string, unknown>): CalendarEvent {
  if (typeof row.id !== 'string') throw new Error('Ugyldig hendelse: mangler id');
  if (typeof row.user_id !== 'string') throw new Error('Ugyldig hendelse: mangler user_id');
  if (typeof row.title !== 'string') throw new Error('Ugyldig hendelse: mangler title');
  if (typeof row.event_date !== 'string') throw new Error('Ugyldig hendelse: mangler event_date');
  if (typeof row.created_at !== 'string') throw new Error('Ugyldig hendelse: mangler created_at');
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    eventDate: row.event_date,
    notes: typeof row.notes === 'string' ? row.notes : null,
    notificationId: typeof row.notification_id === 'string' ? row.notification_id : null,
    createdAt: row.created_at,
  };
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data.map(mapEvent);
}

export async function createCalendarEvent(input: CreateCalendarEventData): Promise<CalendarEvent> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: session.user.id,
      title: input.title,
      event_date: input.eventDate,
      notes: input.notes ?? null,
      notification_id: input.notificationId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapEvent(data);
}

export async function updateCalendarEvent(
  id: string,
  input: Omit<CreateCalendarEventData, 'notificationId'> & { notificationId?: string }
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title: input.title,
      event_date: input.eventDate,
      notes: input.notes ?? null,
      notification_id: input.notificationId ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapEvent(data);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
