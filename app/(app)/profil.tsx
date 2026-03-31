import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { updateProfile } from '@/services/profile';
import {
  scheduleSeasonalReminders,
  cancelSeasonalReminders,
  getSeasonalRemindersEnabled,
} from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { ExperienceLevel } from '@/types';

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'nybegynner', label: 'Nybegynner' },
  { value: 'erfaren', label: 'Erfaren' },
  { value: 'profesjonell', label: 'Profesjonell' },
];

const SUBSCRIPTION_LABELS: Record<string, string> = {
  starter: 'Starter (gratis)',
  hobbyist: 'Hobbyist',
  profesjonell: 'Profesjonell',
  lag: 'Lag',
};

export default function ProfilModal() {
  const { profile, setProfile, signOut } = useAuthStore();
  const showToast = useToastStore((s) => s.show);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(
    profile?.experienceLevel ?? null
  );
  const [seasonalEnabled, setSeasonalEnabled] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
    setExperienceLevel(profile?.experienceLevel ?? null);
    getSeasonalRemindersEnabled().then(setSeasonalEnabled);
  }, [profile]);

  const handleSeasonalToggle = async (value: boolean) => {
    setSeasonalEnabled(value);
    if (value) {
      await scheduleSeasonalReminders();
      showToast('Sesongpåminnelser aktivert', 'success');
    } else {
      await cancelSeasonalReminders();
      showToast('Sesongpåminnelser deaktivert', 'info');
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ displayName: displayName.trim(), experienceLevel }),
    onSuccess: () => {
      if (profile) {
        setProfile({ ...profile, displayName: displayName.trim(), experienceLevel });
      }
      showToast('Profil oppdatert', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message ?? 'Kunne ikke lagre profil. Prøv igjen.', 'error');
    },
  });

  const handleSignOut = () => {
    Alert.alert(
      'Logg ut',
      'Er du sikker på at du vil logge ut?',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Logg ut', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Visningsnavn"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Ditt navn"
          autoCapitalize="words"
          returnKeyType="done"
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Erfaringsnivå</Text>
          <View style={styles.levelRow}>
            {EXPERIENCE_OPTIONS.map((opt) => {
              const active = experienceLevel === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.levelBtn, active && styles.levelBtnActive]}
                  onPress={() => setExperienceLevel(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                >
                  <Text style={[styles.levelBtnText, active && styles.levelBtnTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-post</Text>
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyText}>{profile?.email ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Abonnement</Text>
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyText}>
              {SUBSCRIPTION_LABELS[profile?.subscriptionTier ?? 'starter']}
            </Text>
          </View>
        </View>

        {/* Sesongpåminnelser */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>Sesongpåminnelser</Text>
            <Text style={styles.toggleSub}>Vårsjekk, svermetid, høst, varroabehandling, vinterfôring</Text>
          </View>
          <Switch
            value={seasonalEnabled}
            onValueChange={handleSeasonalToggle}
            trackColor={{ false: Colors.mid + '40', true: Colors.honey + '80' }}
            thumbColor={seasonalEnabled ? Colors.honey : Colors.mid}
          />
        </View>

        {/* Tilbakemeldinger */}
        <Pressable
          style={({ pressed }) => [styles.feedbackBtn, pressed && { opacity: 0.75 }]}
          onPress={() => Linking.openURL('mailto:kontakt@biapp.no?subject=Tilbakemelding%20BiApp')}
          accessibilityRole="button"
        >
          <Text style={styles.feedbackIcon}>✉️</Text>
          <View style={styles.feedbackText}>
            <Text style={styles.feedbackTitle}>Send tilbakemelding</Text>
            <Text style={styles.feedbackSub}>Hjelp oss å forbedre BiApp</Text>
          </View>
          <Text style={styles.feedbackChevron}>›</Text>
        </Pressable>

        <Button
          label={saveMutation.isPending ? 'Lagrer...' : 'Lagre'}
          onPress={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          disabled={saveMutation.isPending}
        />

        <Button
          label="Logg ut"
          variant="danger"
          onPress={handleSignOut}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 16, gap: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  fieldGroup: { gap: 0 },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  levelBtnActive: { borderColor: Colors.honey, backgroundColor: Colors.honey + '15' },
  levelBtnText: { fontSize: 13, fontWeight: '600', color: Colors.mid },
  levelBtnTextActive: { color: Colors.honey },
  readOnly: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.mid + '15',
  },
  readOnlyText: { fontSize: 15, color: Colors.mid },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.mid + '15',
  },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  toggleSub: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.mid + '15',
  },
  feedbackIcon: { fontSize: 20 },
  feedbackText: { flex: 1 },
  feedbackTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  feedbackSub: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  feedbackChevron: { fontSize: 22, color: Colors.mid, fontWeight: '300' },
});
