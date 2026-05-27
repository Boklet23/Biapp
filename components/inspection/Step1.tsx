import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/colors';
import { sharedStyles } from './inspectionStyles';

function formatDateForDisplay(d: Date): string {
  return d.toLocaleString('nb-NO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export interface Step1Props {
  inspectedAt: Date;
  setInspectedAt: (v: Date) => void;
  weatherTemp: string;
  setWeatherTemp: (v: string) => void;
  weatherCondition: string;
  setWeatherCondition: (v: string) => void;
  weatherLoading: boolean;
}

export function Step1({
  inspectedAt, setInspectedAt,
  weatherTemp, setWeatherTemp,
  weatherCondition, setWeatherCondition,
  weatherLoading,
}: Step1Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleOpenPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: inspectedAt,
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (event.type !== 'set' || !selectedDate) return;
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: 'time',
            is24Hour: true,
            onChange: (timeEvent, dateTime) => {
              if (timeEvent.type === 'set' && dateTime) setInspectedAt(dateTime);
            },
          });
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View style={sharedStyles.stepContent}>
      <Text style={sharedStyles.stepHeading}>Grunninfo</Text>

      <View style={sharedStyles.field}>
        <Text style={sharedStyles.label}>Dato og tid</Text>
        <Pressable
          style={sharedStyles.input}
          onPress={handleOpenPicker}
          accessibilityRole="button"
          accessibilityLabel="Velg dato og tid"
        >
          <Text style={sharedStyles.inputText}>{formatDateForDisplay(inspectedAt)}</Text>
        </Pressable>
        {showPicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={inspectedAt}
            mode="datetime"
            display="inline"
            onChange={(_, date) => { if (date) setInspectedAt(date); }}
          />
        )}
      </View>

      <View style={sharedStyles.row}>
        <View style={[sharedStyles.field, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <Text style={[sharedStyles.label, { marginBottom: 0 }]}>Temperatur (°C)</Text>
            {weatherLoading && <ActivityIndicator size="small" color={Colors.honey} style={styles.labelSpinner} />}
          </View>
          <TextInput
            style={sharedStyles.input}
            value={weatherTemp}
            onChangeText={setWeatherTemp}
            keyboardType="numeric"
            placeholder={weatherLoading ? 'Henter…' : 'f.eks. 18'}
            placeholderTextColor={Colors.mid + '80'}
            editable={!weatherLoading}
          />
        </View>
        <View style={[sharedStyles.field, { flex: 2 }]}>
          <Text style={sharedStyles.label}>Vær</Text>
          <TextInput
            style={sharedStyles.input}
            value={weatherCondition}
            onChangeText={setWeatherCondition}
            placeholder={weatherLoading ? 'Henter…' : 'f.eks. sol, overskyet'}
            placeholderTextColor={Colors.mid + '80'}
            editable={!weatherLoading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelSpinner: { marginLeft: 6 },
});
