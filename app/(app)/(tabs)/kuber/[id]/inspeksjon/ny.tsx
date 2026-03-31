import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StepIndicator } from '@/components/inspection/StepIndicator';
import { FrameCounter } from '@/components/inspection/FrameCounter';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { MOOD_EMOJIS } from '@/constants/ui';
import { fetchHive } from '@/services/hive';
import { createInspection } from '@/services/inspection';
import { fetchWeather } from '@/services/weather';

const STEP_LABELS = ['Grunninfo', 'Kubestatus', 'Helse', 'Notater'];
const VARROA_METHODS = ['vaskemetode', 'sukkerpuder', 'limbunn'];
const TOTAL_STEPS = 4;

function formatDateForDisplay(d: Date): string {
  return d.toLocaleString('nb-NO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Step 1: Grunninfo ──────────────────────────────────────────────────────

interface Step1Props {
  inspectedAt: Date;
  setInspectedAt: (v: Date) => void;
  weatherTemp: string;
  setWeatherTemp: (v: string) => void;
  weatherCondition: string;
  setWeatherCondition: (v: string) => void;
  weatherLoading: boolean;
}

function Step1({ inspectedAt, setInspectedAt, weatherTemp, setWeatherTemp, weatherCondition, setWeatherCondition, weatherLoading }: Step1Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Grunninfo</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Dato og tid</Text>
        <Pressable
          style={styles.input}
          onPress={() => setShowPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Velg dato og tid"
        >
          <Text style={styles.inputText}>{formatDateForDisplay(inspectedAt)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={inspectedAt}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (date) setInspectedAt(date);
            }}
          />
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { marginBottom: 0 }]}>Temperatur (°C)</Text>
            {weatherLoading && <ActivityIndicator size="small" color={Colors.honey} style={styles.labelSpinner} />}
          </View>
          <TextInput
            style={styles.input}
            value={weatherTemp}
            onChangeText={setWeatherTemp}
            keyboardType="numeric"
            placeholder={weatherLoading ? 'Henter…' : 'f.eks. 18'}
            placeholderTextColor={Colors.mid + '80'}
            editable={!weatherLoading}
          />
        </View>
        <View style={[styles.field, { flex: 2 }]}>
          <Text style={styles.label}>Vær</Text>
          <TextInput
            style={styles.input}
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

// ─── Step 2: Kubestatus ─────────────────────────────────────────────────────

interface Step2Props {
  framesbrood: number;
  setFramesBrood: (v: number) => void;
  framesHoney: number;
  setFramesHoney: (v: number) => void;
  framesEmpty: number;
  setFramesEmpty: (v: number) => void;
  queenSeen: boolean;
  setQueenSeen: (v: boolean) => void;
  queenCells: boolean;
  setQueenCells: (v: boolean) => void;
}

function Step2({ framesbrood, setFramesBrood, framesHoney, setFramesHoney, framesEmpty, setFramesEmpty, queenSeen, setQueenSeen, queenCells, setQueenCells }: Step2Props) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Kubestatus</Text>

      <FrameCounter label="Yngelrammer" value={framesbrood} onChange={setFramesBrood} />
      <FrameCounter label="Honningrammer" value={framesHoney} onChange={setFramesHoney} />
      <FrameCounter label="Tomme rammer" value={framesEmpty} onChange={setFramesEmpty} />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Dronning sett</Text>
        <Switch
          value={queenSeen}
          onValueChange={setQueenSeen}
          trackColor={{ true: Colors.honey }}
          thumbColor={Colors.white}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Dronningceller funnet</Text>
        <Switch
          value={queenCells}
          onValueChange={setQueenCells}
          trackColor={{ true: Colors.warning }}
          thumbColor={Colors.white}
        />
      </View>
    </View>
  );
}

// ─── Step 3: Helse ──────────────────────────────────────────────────────────

interface Step3Props {
  varroaCount: string;
  setVarroaCount: (v: string) => void;
  varroaMethod: string;
  setVarroaMethod: (v: string) => void;
  treatmentApplied: boolean;
  setTreatmentApplied: (v: boolean) => void;
  treatmentProduct: string;
  setTreatmentProduct: (v: string) => void;
}

function Step3({ varroaCount, setVarroaCount, varroaMethod, setVarroaMethod, treatmentApplied, setTreatmentApplied, treatmentProduct, setTreatmentProduct }: Step3Props) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Helse</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Varroa-telling</Text>
        <TextInput
          style={styles.input}
          value={varroaCount}
          onChangeText={setVarroaCount}
          keyboardType="numeric"
          placeholder="Antall midd"
          placeholderTextColor={Colors.mid + '80'}
        />
      </View>

      <Text style={styles.label}>Metode</Text>
      <View style={styles.methodRow}>
        {VARROA_METHODS.map((m) => (
          <Pressable
            key={m}
            style={[styles.methodChip, varroaMethod === m && styles.methodChipSelected]}
            onPress={() => setVarroaMethod(varroaMethod === m ? '' : m)}
          >
            <Text style={[styles.methodChipText, varroaMethod === m && styles.methodChipTextSelected]}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Behandling utført</Text>
        <Switch
          value={treatmentApplied}
          onValueChange={setTreatmentApplied}
          trackColor={{ true: Colors.honey }}
          thumbColor={Colors.white}
        />
      </View>

      {treatmentApplied && (
        <View style={styles.field}>
          <Text style={styles.label}>Produkt brukt</Text>
          <TextInput
            style={styles.input}
            value={treatmentProduct}
            onChangeText={setTreatmentProduct}
            placeholder="f.eks. Oxalsyre, ApiLife Var"
            placeholderTextColor={Colors.mid + '80'}
          />
        </View>
      )}
    </View>
  );
}

// ─── Step 4: Notater ────────────────────────────────────────────────────────

interface Step4Props {
  notes: string;
  setNotes: (v: string) => void;
  moodScore: number;
  setMoodScore: (v: number) => void;
}

function Step4({ notes, setNotes, moodScore, setMoodScore }: Step4Props) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Notater og humør</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Observasjoner</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Hva la du merke til?"
          placeholderTextColor={Colors.mid + '80'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <Text style={styles.label}>Kubehumør</Text>
      <View style={styles.moodRow}>
        {MOOD_EMOJIS.map((emoji, i) => {
          const score = i + 1;
          return (
            <Pressable
              key={score}
              style={[styles.moodBtn, moodScore === score && styles.moodBtnSelected]}
              onPress={() => setMoodScore(score)}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
              <Text style={styles.moodLabel}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main wizard ────────────────────────────────────────────────────────────

export default function NyInspeksjon() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  // Step 1
  const [inspectedAt, setInspectedAt] = useState(new Date());
  const [weatherTemp, setWeatherTemp] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const weatherFetched = useRef(false);

  const { data: hive } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
  });

  useEffect(() => {
    if (hive?.locationLat && hive?.locationLng && !weatherFetched.current) {
      weatherFetched.current = true;
      setWeatherLoading(true);
      fetchWeather(hive.locationLat, hive.locationLng)
        .then((w) => {
          if (w) {
            setWeatherTemp(String(w.temp));
            setWeatherCondition(w.condition);
          }
        })
        .finally(() => setWeatherLoading(false));
    }
  }, [hive]);

  // Step 2
  const [framesBrood, setFramesBrood] = useState(0);
  const [framesHoney, setFramesHoney] = useState(0);
  const [framesEmpty, setFramesEmpty] = useState(0);
  const [queenSeen, setQueenSeen] = useState(false);
  const [queenCells, setQueenCells] = useState(false);

  // Step 3
  const [varroaCount, setVarroaCount] = useState('');
  const [varroaMethod, setVarroaMethod] = useState('');
  const [treatmentApplied, setTreatmentApplied] = useState(false);
  const [treatmentProduct, setTreatmentProduct] = useState('');

  // Step 4
  const [notes, setNotes] = useState('');
  const [moodScore, setMoodScore] = useState(0);

  const mutation = useMutation({
    mutationFn: createInspection,
    onSuccess: (insp) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
      router.replace({ pathname: '/kuber/[id]/inspeksjon/[inspId]', params: { id, inspId: insp.id } });
    },
  });

  const isFirstStep = step === 1;
  const isLastStep = step === TOTAL_STEPS;

  const handleNext = () => {
    if (isLastStep) {
      mutation.mutate({
        hiveId: id,
        inspectedAt: inspectedAt.toISOString(),
        weatherTemp: weatherTemp ? Number(weatherTemp) : undefined,
        weatherCondition: weatherCondition.trim() || undefined,
        numFramesBrood: framesBrood,
        numFramesHoney: framesHoney,
        numFramesEmpty: framesEmpty,
        queenSeen,
        queenCellsFound: queenCells,
        varroaCount: varroaCount ? Number(varroaCount) : undefined,
        varroaMethod: varroaMethod || undefined,
        treatmentApplied,
        treatmentProduct: treatmentProduct.trim() || undefined,
        notes: notes.trim() || undefined,
        moodScore: moodScore || undefined,
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      Alert.alert(
        'Avbryt inspeksjon?',
        'Data du har lagt inn vil ikke bli lagret.',
        [
          { text: 'Fortsett', style: 'cancel' },
          { text: 'Avbryt', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      setStep((s) => s - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {mutation.isError && (
          <Text style={styles.serverError}>
            Kunne ikke lagre inspeksjon. Prøv igjen.
          </Text>
        )}

        {step === 1 && (
          <Step1
            inspectedAt={inspectedAt}
            setInspectedAt={setInspectedAt}
            weatherTemp={weatherTemp}
            setWeatherTemp={setWeatherTemp}
            weatherCondition={weatherCondition}
            setWeatherCondition={setWeatherCondition}
            weatherLoading={weatherLoading}
          />
        )}
        {step === 2 && (
          <Step2
            framesbrood={framesBrood}
            setFramesBrood={setFramesBrood}
            framesHoney={framesHoney}
            setFramesHoney={setFramesHoney}
            framesEmpty={framesEmpty}
            setFramesEmpty={setFramesEmpty}
            queenSeen={queenSeen}
            setQueenSeen={setQueenSeen}
            queenCells={queenCells}
            setQueenCells={setQueenCells}
          />
        )}
        {step === 3 && (
          <Step3
            varroaCount={varroaCount}
            setVarroaCount={setVarroaCount}
            varroaMethod={varroaMethod}
            setVarroaMethod={setVarroaMethod}
            treatmentApplied={treatmentApplied}
            setTreatmentApplied={setTreatmentApplied}
            treatmentProduct={treatmentProduct}
            setTreatmentProduct={setTreatmentProduct}
          />
        )}
        {step === 4 && (
          <Step4
            notes={notes}
            setNotes={setNotes}
            moodScore={moodScore}
            setMoodScore={setMoodScore}
          />
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, styles.navBtnBack, pressed && styles.navBtnPressed]}
          onPress={handleBack}
        >
          <Text style={styles.navBtnBackText}>{isFirstStep ? 'Avbryt' : '← Tilbake'}</Text>
        </Pressable>

        <Button
          label={isLastStep ? 'Lagre inspeksjon' : 'Neste →'}
          onPress={handleNext}
          loading={mutation.isPending}
          style={styles.navBtnNext}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  stepContent: { paddingTop: 8 },
  stepHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 20,
  },

  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  inputText: {
    fontSize: 15,
    color: Colors.dark,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  toggleLabel: { fontSize: 15, color: Colors.dark, fontWeight: '500' },

  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
  },
  methodChipSelected: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honey,
  },
  methodChipText: { fontSize: 13, color: Colors.dark },
  methodChipTextSelected: { color: Colors.white, fontWeight: '600' },

  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  moodBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
  },
  moodBtnSelected: {
    borderColor: Colors.honey,
    backgroundColor: Colors.amber,
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 12, color: Colors.mid, marginTop: 4 },

  navBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: Colors.light,
    borderTopWidth: 1,
    borderTopColor: Colors.mid + '15',
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnBack: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
  },
  navBtnPressed: { opacity: 0.7 },
  navBtnBackText: { fontSize: 15, color: Colors.mid, fontWeight: '600' },
  navBtnNext: { flex: 1 },

  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelSpinner: { marginLeft: 6 },

  serverError: {
    backgroundColor: '#FADBD8',
    color: Colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
  },
});
