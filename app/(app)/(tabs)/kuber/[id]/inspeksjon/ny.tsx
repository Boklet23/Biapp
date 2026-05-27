import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StepIndicator } from '@/components/inspection/StepIndicator';
import { HiveScene } from '@/components/animations/HiveScene';
import { INSPECTION_STEP_SCENE } from '@/constants/hiveScene';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { fetchHive } from '@/services/hive';
import { createInspection, uploadInspectionPhoto, createInspectionMedia, CreateInspectionData } from '@/services/inspection';
import { supabase } from '@/lib/supabase';
import { fetchWeather } from '@/services/weather';
import { useToastStore } from '@/store/toast';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import type { VarroaAnalysis } from '@/types';
import { Step1 } from '@/components/inspection/Step1';
import { Step2 } from '@/components/inspection/Step2';
import { Step3 } from '@/components/inspection/Step3';
import { Step4 } from '@/components/inspection/Step4';

const STEP_LABELS = ['Grunninfo', 'Kubestatus', 'Helse', 'Notater'];
const TOTAL_STEPS = 4;

const draftKey = (hiveId: string) => `bivokter_insp_draft_${hiveId}`;

interface DraftState {
  weatherTemp: string;
  weatherCondition: string;
  framesBrood: number;
  framesHoney: number;
  framesEmpty: number;
  queenSeen: boolean;
  queenCells: boolean;
  varroaCount: string;
  varroaMethod: string;
  treatmentApplied: boolean;
  treatmentProduct: string;
  notes: string;
  moodScore: number;
}

export default function NyInspeksjon() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const effectiveTier = useEffectiveTier();
  const isAiLocked = effectiveTier === 'starter';
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const [step, setStep] = useState(1);
  const draftRestored = useRef(false);

  // Step 1
  const [inspectedAt, setInspectedAt] = useState(new Date());
  const [weatherTemp, setWeatherTemp] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const weatherFetched = useRef(false);

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
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const { data: hive } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
  });

  // Restore draft on mount
  useEffect(() => {
    if (!id || draftRestored.current) return;
    draftRestored.current = true;
    AsyncStorage.getItem(draftKey(id)).then((raw) => {
      if (!raw) return;
      try {
        const draft: DraftState = JSON.parse(raw);
        setWeatherTemp(draft.weatherTemp ?? '');
        setWeatherCondition(draft.weatherCondition ?? '');
        setFramesBrood(draft.framesBrood ?? 0);
        setFramesHoney(draft.framesHoney ?? 0);
        setFramesEmpty(draft.framesEmpty ?? 0);
        setQueenSeen(draft.queenSeen ?? false);
        setQueenCells(draft.queenCells ?? false);
        setVarroaCount(draft.varroaCount ?? '');
        setVarroaMethod(draft.varroaMethod ?? '');
        setTreatmentApplied(draft.treatmentApplied ?? false);
        setTreatmentProduct(draft.treatmentProduct ?? '');
        setNotes(draft.notes ?? '');
        setMoodScore(draft.moodScore ?? 0);
      } catch {
        AsyncStorage.removeItem(draftKey(id)).catch(() => {});
      }
    }).catch(() => {});
  }, [id]);

  // Save draft whenever fields change
  useEffect(() => {
    if (!id || !draftRestored.current) return;
    const draft: DraftState = {
      weatherTemp, weatherCondition,
      framesBrood, framesHoney, framesEmpty,
      queenSeen, queenCells,
      varroaCount, varroaMethod,
      treatmentApplied, treatmentProduct,
      notes, moodScore,
    };
    AsyncStorage.setItem(draftKey(id), JSON.stringify(draft)).catch(() => {});
  }, [
    id, weatherTemp, weatherCondition,
    framesBrood, framesHoney, framesEmpty,
    queenSeen, queenCells,
    varroaCount, varroaMethod,
    treatmentApplied, treatmentProduct,
    notes, moodScore,
  ]);

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
        .catch(() => {})
        .finally(() => setWeatherLoading(false));
    }
  }, [hive]);

  const handleAddPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Tillatelse nektet', 'Gi BiVokter tilgang til bilder i innstillingene.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotoUris((prev) => prev.filter((u) => u !== uri));
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateInspectionData) => {
      const insp = await createInspection(data);
      if (photoUris.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const results = await Promise.allSettled(
            photoUris.map(async (uri) => {
              const path = await uploadInspectionPhoto(uri, insp.id, session.user.id, session.access_token);
              await createInspectionMedia(insp.id, path);
            }),
          );
          const failures = results.filter((r) => r.status === 'rejected').length;
          if (failures > 0) showToast(`${failures} bilde(r) ble ikke lastet opp`, 'error');
        }
      }
      return insp;
    },
    onError: (error: Error) => showToast(error.message ?? 'Kunne ikke lagre inspeksjon', 'error'),
    onSuccess: (insp) => {
      AsyncStorage.removeItem(draftKey(id)).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
      queryClient.invalidateQueries({ queryKey: ['last-inspection-per-hive'] });
      queryClient.invalidateQueries({ queryKey: ['all-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-media', insp.id] });
      router.replace({ pathname: '/kuber/[id]/inspeksjon/[inspId]', params: { id, inspId: insp.id } });
    },
  });

  const isFirstStep = step === 1;
  const isLastStep = step === TOTAL_STEPS;

  const handleNext = () => {
    if (isLastStep) {
      if (varroaCount !== '' && isNaN(Number(varroaCount))) {
        showToast('Varroa-telling må være et tall', 'error');
        return;
      }
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
          {
            text: 'Avbryt',
            style: 'destructive',
            onPress: () => {
              AsyncStorage.removeItem(draftKey(id)).catch(() => {});
              router.back();
            },
          },
        ],
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

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {mutation.isError && (
          <Text style={styles.serverError}>Kunne ikke lagre inspeksjon. Prøv igjen.</Text>
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
            photoUris={photoUris}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
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

  serverError: {
    backgroundColor: '#FADBD8',
    color: Colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
});
