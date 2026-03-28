import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { MonthView } from '@/components/calendar/MonthView';
import { SeasonGuide } from '@/components/calendar/SeasonGuide';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { Colors } from '@/constants/colors';
import { fetchAllInspections } from '@/services/inspection';
import { fetchCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '@/services/calendarEvent';
import { scheduleEventNotification, cancelNotification } from '@/services/notifications';
import { useToastStore } from '@/store/toast';
import { CalendarEvent, Inspection } from '@/types';

const MONTH_NAMES = [
  '', 'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

const MOOD_EMOJI = ['', '😟', '😐', '😊', '😁', '🤩'];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

export default function Kalender() {
  const today = new Date();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: allInspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: fetchAllInspections,
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchCalendarEvents,
  });

  const createMutation = useMutation({
    mutationFn: async (args: { title: string; date: string; notes: string }) => {
      const notifId = await scheduleEventNotification('new', args.title, args.date);
      return createCalendarEvent({
        title: args.title,
        eventDate: args.date,
        notes: args.notes || undefined,
        notificationId: notifId ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setModalVisible(false);
      showToast('Hendelse lagret!', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message ?? 'Kunne ikke lagre hendelse', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      if (event.notificationId) {
        await cancelNotification(event.notificationId);
      }
      await deleteCalendarEvent(event.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      showToast('Hendelse slettet', 'success');
    },
  });

  const inspectionDates = useMemo(() => {
    const set = new Set<string>();
    allInspections.forEach((insp) => set.add(insp.inspectedAt.slice(0, 10)));
    return set;
  }, [allInspections]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => set.add(ev.eventDate));
    return set;
  }, [allEvents]);

  const selectedInspections = useMemo<Inspection[]>(() => {
    if (!selectedDate) return [];
    return allInspections.filter((insp) => insp.inspectedAt.slice(0, 10) === selectedDate);
  }, [selectedDate, allInspections]);

  const selectedEvents = useMemo<CalendarEvent[]>(() => {
    if (!selectedDate) return [];
    return allEvents.filter((ev) => ev.eventDate === selectedDate);
  }, [selectedDate, allEvents]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  function handleDeleteEvent(event: CalendarEvent) {
    Alert.alert('Slett hendelse', `Slette «${event.title}»?`, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => deleteMutation.mutate(event) },
    ]);
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Kalender</Text>

        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn} accessibilityLabel="Forrige måned">
            <Text style={styles.navBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <Pressable onPress={nextMonth} style={styles.navBtn} accessibilityLabel="Neste måned">
            <Text style={styles.navBtnText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <MonthView
            year={year}
            month={month}
            inspectionDates={inspectionDates}
            eventDates={eventDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.honey }]} />
            <Text style={styles.legendText}>Inspeksjon</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>Hendelse</Text>
          </View>
        </View>

        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedDate}</Text>

            {selectedEvents.map((ev) => (
              <Pressable
                key={ev.id}
                style={({ pressed }) => [styles.eventRow, pressed && styles.rowPressed]}
                onLongPress={() => handleDeleteEvent(ev)}
              >
                <View style={styles.eventDot} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  {ev.notes ? <Text style={styles.eventNotes}>{ev.notes}</Text> : null}
                </View>
                <Text style={styles.holdText}>Hold for å slette</Text>
              </Pressable>
            ))}

            {selectedInspections.map((insp) => (
              <Pressable
                key={insp.id}
                style={({ pressed }) => [styles.inspRow, pressed && styles.rowPressed]}
                onPress={() =>
                  router.push({
                    pathname: '/kuber/[id]/inspeksjon/[inspId]',
                    params: { id: insp.hiveId, inspId: insp.id },
                  } as any)
                }
              >
                <View style={styles.inspLeft}>
                  <Text style={styles.inspTime}>{formatTime(insp.inspectedAt)}</Text>
                  {insp.weatherTemp != null && (
                    <Text style={styles.inspSub}>{insp.weatherTemp}°C {insp.weatherCondition ?? ''}</Text>
                  )}
                </View>
                <View style={styles.inspRight}>
                  {insp.moodScore != null && (
                    <Text style={styles.moodEmoji}>{MOOD_EMOJI[insp.moodScore]}</Text>
                  )}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            ))}

            {selectedInspections.length === 0 && selectedEvents.length === 0 && (
              <Text style={styles.emptyText}>Ingen hendelser eller inspeksjoner</Text>
            )}
          </View>
        )}

        <SeasonGuide month={month} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Legg til hendelse"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+ Hendelse</Text>
      </Pressable>

      <AddEventModal
        visible={modalVisible}
        initialDate={selectedDate}
        onClose={() => setModalVisible(false)}
        onSubmit={(title, date, notes) => createMutation.mutate({ title, date, notes })}
        loading={createMutation.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 12, gap: 16, paddingBottom: 100 },
  header: { fontSize: 28, fontWeight: '800', color: Colors.dark },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 28, color: Colors.honey, fontWeight: '300' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },

  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  legend: { flexDirection: 'row', gap: 16, marginTop: -8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.mid },

  section: { gap: 0 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.mid,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
    gap: 10,
  },
  eventDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.success,
    flexShrink: 0,
  },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  eventNotes: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  holdText: { fontSize: 11, color: Colors.mid + '80' },

  inspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  rowPressed: { opacity: 0.6 },
  inspLeft: { gap: 2 },
  inspTime: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  inspSub: { fontSize: 12, color: Colors.mid },
  inspRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodEmoji: { fontSize: 18 },
  chevron: { fontSize: 20, color: Colors.mid },
  emptyText: { fontSize: 14, color: Colors.mid, paddingVertical: 8 },

  fab: {
    position: 'absolute',
    bottom: 24, right: 20,
    backgroundColor: Colors.honey,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
  fabText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
