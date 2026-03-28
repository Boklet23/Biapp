import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

const DAY_HEADERS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

interface MonthViewProps {
  year: number;
  month: number; // 1–12
  inspectionDates: Set<string>; // 'YYYY-MM-DD'
  eventDates: Set<string>; // 'YYYY-MM-DD'
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

function dateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthView({ year, month, inspectionDates, eventDates, selectedDate, onSelectDate }: MonthViewProps) {
  // Monday = 0, Sunday = 6
  const firstDayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const today = new Date();
  const todayStr = dateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <View>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((d) => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day, ci) => {
            if (!day) {
              return <View key={ci} style={styles.cell} />;
            }
            const ds = dateString(year, month, day);
            const hasInsp = inspectionDates.has(ds);
            const hasEvent = eventDates.has(ds);
            const isSelected = selectedDate === ds;
            const isToday = ds === todayStr;

            return (
              <Pressable
                key={ci}
                style={[
                  styles.cell,
                  isSelected && styles.selectedCell,
                  isToday && !isSelected && styles.todayCell,
                ]}
                onPress={() => onSelectDate(isSelected ? null : ds)}
                accessibilityLabel={`${day}. ${month}. ${year}${hasInsp ? ', har inspeksjon' : ''}${hasEvent ? ', har hendelse' : ''}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && !isSelected && styles.todayDayText,
                  ]}
                >
                  {day}
                </Text>
                {(hasInsp || hasEvent) && (
                  <View style={styles.dotRow}>
                    {hasInsp && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                    {hasEvent && <View style={[styles.dot, styles.dotEvent, isSelected && styles.dotSelected]} />}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mid,
  },
  row: { flexDirection: 'row' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selectedCell: {
    backgroundColor: Colors.honey,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: Colors.honey,
  },
  dayText: {
    fontSize: 15,
    color: Colors.dark,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: '700',
  },
  todayDayText: {
    color: Colors.honey,
    fontWeight: '700',
  },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.honey,
  },
  dotEvent: { backgroundColor: Colors.success },
  dotSelected: { backgroundColor: Colors.white },
});
