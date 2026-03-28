import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types';

export interface CreateCalendarEventData {
  title: string;
  eventDate: string; // 'YYYY-MM-DD'
  notes?: string;
  notificationId?: string;
}

function mapEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    eventDate: row.event_date as string,
    notes: row.notes as string | null,
    notificationId: row.notification_id as string | null,
    createdAt: row.created_at as string,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
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

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
