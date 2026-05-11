import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StepIndicator } from '@/components/inspection/StepIndicator';
import { FrameCounter } from '@/components/inspection/FrameCounter';
import { HiveScene } from '@/components/animations/HiveScene';
import { INSPECTION_STEP_SCENE } from '@/constants/hiveScene';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { MOOD_EMOJIS } from '@/constants/ui';
import { fetchHive } from '@/services/hive';
import { createInspection, analyzeVarroa } from '@/services/inspection';
import { fetchWeather } from '@/services/weather';
import { useToastStore } from '@/store/toast';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import type { VarroaAnalysis } from '@/types';

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
  const [showPicker, setShowPicker] = useState(false); // iOS only

  const handleOpenPicker = () => {
    if (Platform.OS === 'android') {
      // Imperative API avoids the dismiss-of-undefined crash on New Architecture
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
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Grunninfo</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Dato og tid</Text>
        <Pressable
          style={styles.input}
          onPress={handleOpenPicker}
          accessibilityRole="button"
          accessibilityLabel="Velg dato og tid"
        >
          <Text style={styles.inputText}>{formatDateForDisplay(inspectedAt)}</Text>
        </Pressable>
        {showPicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={inspectedAt}
            mode="datetime"
            display="inline"
            onChange={(_, date) => {
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

const SEVERITY_META: Record<string, { label: string; color: string; bg: string }> = {
  none:   { label: 'Ingen',   color: Colors.success, bg: Colors.successSoft },
  low:    { label: 'Lav',     color: '#D4891A',      bg: '#FEF3E2' },
  medium: { label: 'Middels', color: '#E67E22',      bg: '#FEF3E2' },
  high:   { label: 'Høy',     color: Colors.error,   bg: Colors.errorSoft },
};

interface Step3Props {
  varroaCount: string;
  setVarroaCount: (v: string) => void;
  varroaMethod: string;
  setVarroaMethod: (v: string) => void;
  treatmentApplied: boolean;
  setTreatmentApplied: (v: boolean) => void;
  treatmentProduct: string;
  setTreatmentProduct: (v: string) => void;
  onAiResult: (r: VarroaAnalysis) => void;
  isAiLocked: boolean;
  onOpenUpgrade: () => void;
}

function Step3({
  varroaCount, setVarroaCount, varroaMethod, setVarroaMethod,
  treatmentApplied, setTreatmentApplied, treatmentProduct, setTreatmentProduct,
  onAiResult, isAiLocked, onOpenUpgrade,
}: Step3Props) {
  const [analyzing, setAnalyzing]   = useState(false);
  const [aiResult, setAiResult]     = useState<VarroaAnalysis | null>(null);
  const [imageUri, setImageUri]     = useState<string | null>(null);
  const showToast = useToastStore((s) => s.show);

  const handleAiAnalyze = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Tillatelse nektet', 'Gi BiVokter tilgang til bilder i innstillingene.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
        exif: false,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]?.base64) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);
      setAnalyzing(true);

      const mimeType = asset.mimeType === 'image/png' ? 'image/png'
                     : asset.mimeType === 'image/webp' ? 'image/webp'
                     : 'image/jpeg';

      const analysis = await analyzeVarroa(asset.base64!, mimeType);
      setAiResult(analysis);
      onAiResult(analysis);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Analyse feilet', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const severity = aiResult ? (SEVERITY_META[aiResult.severity] ?? SEVERITY_META.low) : null;

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

      {/* AI Varroa analyse */}
      <View style={styles.aiSection}>
        {isAiLocked ? (
          <Pressable
            style={styles.aiBtnLocked}
            onPress={onOpenUpgrade}
            accessibilityLabel="AI-analyse krever Hobbyist-abonnement"
          >
            <Text style={styles.aiBtnText}>🔒  Analyser klisterplate med AI</Text>
            <Text style={styles.aiBtnLockedSub}>Krever Hobbyist eller høyere</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.aiBtn, pressed && { opacity: 0.75 }]}
            onPress={handleAiAnalyze}
            disabled={analyzing}
            accessibilityLabel="Analyser varroabilde med AI"
          >
            {analyzing ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.aiBtnText}>🔬  Analyser klisterplate med AI</Text>
            )}
          </Pressable>
        )}

        {aiResult && severity && (
          <View style={[styles.aiCard, { borderLeftColor: severity.color }]}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.aiThumb} resizeMode="cover" />
            )}
            <View style={styles.aiCardBody}>
              <View style={styles.aiCardHeader}>
                <Text style={styles.aiCount}>
                  {aiResult.count >= 0 ? `${aiResult.count} mitter` : 'Uklar telling'}
                </Text>
                <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
                  <Text style={[styles.severityText, { color: severity.color }]}>
                    {severity.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.aiRec}>{aiResult.recommendation}</Text>
              {aiResult.count >= 0 && (
                <Pressable
                  style={styles.useResultBtn}
                  onPress={() => setVarroaCount(String(aiResult.count))}
                >
                  <Text style={styles.useResultText}>Bruk {aiResult.count} som telleresultat</Text>
                </Pressable>
              )}
              <Text style={styles.aiUsage}>
                {aiResult.usageThisMonth} / {aiResult.monthlyLimit} analyser denne måneden
              </Text>
            </View>
          </View>
        )}
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
  const showToast = useToastStore((s) => s.show);
  const effectiveTier = useEffectiveTier();
  const isAiLocked = effectiveTier === 'starter';
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

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
  const [varroaAiResult, setVarroaAiResult] = useState<VarroaAnalysis | null>(null);

  // Step 4
  const [notes, setNotes] = useState('');
  const [moodScore, setMoodScore] = useState(0);

  const mutation = useMutation({
    mutationFn: createInspection,
    onError: (error: Error) => showToast(error.message ?? 'Kunne ikke lagre inspeksjon', 'error'),
    onSuccess: (insp) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
      queryClient.invalidateQueries({ queryKey: ['last-inspection-per-hive'] });
      queryClient.invalidateQueries({ queryKey: ['all-inspections'] });
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
        varroaAiCount: varroaAiResult?.count != null && varroaAiResult.count >= 0 ? varroaAiResult.count : undefined,
        varroaAiSeverity: varroaAiResult?.severity,
        varroaAiRecommendation: varroaAiResult?.recommendation,
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
      <HiveScene scene={INSPECTION_STEP_SCENE[step]} height={130} />
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
            onAiResult={setVarroaAiResult}
            isAiLocked={isAiLocked}
            onOpenUpgrade={() => setUpgradeModalVisible(true)}
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
      <UpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />
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
    fontFamily: FontFamily.extrabold,
    color: Colors.dark,
    marginBottom: 20,
  },

  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: Colors.dark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  inputText: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
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
  toggleLabel: { fontSize: 15, fontFamily: FontFamily.medium, color: Colors.dark, fontWeight: '500' },

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
  methodChipText: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.dark },
  methodChipTextSelected: { fontFamily: FontFamily.semibold, color: Colors.white, fontWeight: '600' },

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
  moodLabel: { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.mid, marginTop: 4 },

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
  navBtnBackText: { fontSize: 15, fontFamily: FontFamily.semibold, color: Colors.mid, fontWeight: '600' },
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
    fontFamily: FontFamily.regular,
  },

  // AI Varroa analyse
  aiSection: {
    marginBottom: 16,
  },
  aiBtn: {
    backgroundColor: Colors.info,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  aiBtnLocked: {
    backgroundColor: Colors.mid + '44',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    gap: 2,
  },
  aiBtnLockedSub: {
    fontSize: 11,
    color: Colors.dark + 'AA',
  },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  aiCard: {
    marginTop: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  aiThumb: {
    width: 80,
    height: 80,
    alignSelf: 'stretch',
  },
  aiCardBody: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCount: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.dark,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    letterSpacing: 0.5,
  },
  aiRec: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
    lineHeight: 17,
  },
  useResultBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  useResultText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.dark,
  },
  aiUsage: {
    fontSize: 10,
    fontFamily: FontFamily.regular,
    color: Colors.mid + 'AA',
  },
});
