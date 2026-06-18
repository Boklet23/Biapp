import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Colors, Shadows } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { registerPushToken, scheduleSeasonalReminders } from '@/services/notifications';

const DISMISSED_KEY = 'bivokter_activation_guide_dismissed';
const isExpoGo = Constants.appOwnership === 'expo';

interface Step {
  label: string;
  hint: string;
  done: boolean;
  onPress: () => void;
}

interface ActivationGuideProps {
  hiveCount: number;
  inspectionCount: number;
  firstHiveId?: string | null;
}

export function ActivationGuide({ hiveCount, inspectionCount, firstHiveId }: ActivationGuideProps) {
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then((val) => {
      setDismissed(val === '1');
    }).catch(() => setDismissed(false));
  }, []);

  useEffect(() => {
    if (isExpoGo) return;
    import('expo-notifications').then(({ getPermissionsAsync }) => {
      getPermissionsAsync().then(({ status }) => {
        setNotificationsGranted(status === 'granted');
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const step1Done = hiveCount > 0;
  const step2Done = inspectionCount > 0;
  const step3Done = notificationsGranted;

  const allDone = step1Done && step2Done && step3Done;

  useEffect(() => {
    if (allDone && !dismissedRef.current) {
      dismissedRef.current = true;
      AsyncStorage.setItem(DISMISSED_KEY, '1').catch(() => {});
      setDismissed(true);
    }
  }, [allDone]);

  const handleDismiss = () => {
    AsyncStorage.setItem(DISMISSED_KEY, '1').catch(() => {});
    setDismissed(true);
  };

  if (dismissed !== false) return null;

  const enableNotifications = () => {
    if (isExpoGo) return;
    // Forklarende pre-prompt før OS-dialogen — på Android 13+ får man i praksis
    // bare ett forsøk, så vi forklarer verdien først for å maksimere aksept.
    Alert.alert(
      'Slå på varsler?',
      'Få påminnelser om inspeksjoner, svermetid og varroabehandling til rett tid i sesongen.',
      [
        { text: 'Ikke nå', style: 'cancel' },
        {
          text: 'Slå på',
          onPress: () => {
            import('expo-notifications').then(({ requestPermissionsAsync }) => {
              requestPermissionsAsync().then(({ status }) => {
                const granted = status === 'granted';
                setNotificationsGranted(granted);
                if (granted) {
                  registerPushToken();
                  scheduleSeasonalReminders().catch(() => {});
                }
              }).catch(() => {});
            }).catch(() => {});
          },
        },
      ],
    );
  };

  const steps: Step[] = [
    {
      label: 'Legg til din første kube',
      hint: 'Registrer kube med navn og plassering',
      done: step1Done,
      onPress: () => router.push('/(app)/(tabs)/kuber/ny' as any),
    },
    {
      label: 'Gjennomfør en inspeksjon',
      hint: 'Logg helse, varroa og dronning',
      done: step2Done,
      // Med nøyaktig én kube: hopp rett inn i inspeksjonsveiviseren (aha-moment).
      // Flere kuber → kubelista så brukeren velger hvilken.
      onPress: () =>
        hiveCount === 1 && firstHiveId
          ? router.push({ pathname: '/kuber/[id]/inspeksjon/ny', params: { id: firstHiveId } } as any)
          : router.push('/(app)/(tabs)/kuber' as any),
    },
    {
      label: 'Aktiver varsler',
      hint: 'Få påminnelser om inspeksjoner og varroa',
      done: step3Done,
      onPress: enableNotifications,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kom i gang</Text>
        <Text style={styles.progress}>{doneCount}/3</Text>
        <Pressable onPress={handleDismiss} style={styles.closeBtn} accessibilityLabel="Skjul kom-i-gang-guide">
          <Text style={styles.closeIcon}>×</Text>
        </Pressable>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(doneCount / 3) * 100}%` }]} />
      </View>
      {steps.map((step, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.step,
            i < steps.length - 1 && styles.stepBorder,
            step.done && styles.stepDone,
            pressed && !step.done && { opacity: 0.7 },
          ]}
          onPress={step.done ? undefined : step.onPress}
          accessibilityRole={step.done ? undefined : 'button'}
          accessibilityLabel={step.label}
        >
          <View style={[styles.check, step.done && styles.checkDone]}>
            {step.done && <Text style={styles.checkIcon}>✓</Text>}
          </View>
          <View style={styles.stepText}>
            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
            {!step.done && <Text style={styles.stepHint}>{step.hint}</Text>}
          </View>
          {!step.done && <Text style={styles.stepArrow}>›</Text>}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: Colors.dark,
  },
  progress: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: Colors.mid,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.mid,
    lineHeight: 24,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.mid + '20',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.honey,
    borderRadius: 2,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '12',
  },
  stepDone: { opacity: 0.55 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.mid + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honey,
  },
  checkIcon: { fontSize: 13, color: Colors.white, fontWeight: '700' },
  stepText: { flex: 1, gap: 2 },
  stepLabel: { fontSize: 14, fontFamily: FontFamily.semibold, fontWeight: '600', color: Colors.dark },
  stepLabelDone: { textDecorationLine: 'line-through', color: Colors.mid },
  stepHint: { fontSize: 12, color: Colors.mid, fontFamily: FontFamily.regular },
  stepArrow: { fontSize: 20, color: Colors.mid },
});
