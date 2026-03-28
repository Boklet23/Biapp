import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { updateProfile } from '@/services/profile';
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

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
    setExperienceLevel(profile?.experienceLevel ?? null);
  }, [profile]);

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

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saveMutation.isPending && styles.saveBtnDisabled]}
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.saveBtnText}>
            {saveMutation.isPending ? 'Lagrer...' : 'Lagre'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
          onPress={handleSignOut}
          accessibilityRole="button"
        >
          <Text style={styles.signOutBtnText}>Logg ut</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 16, gap: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
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
  saveBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnPressed: { opacity: 0.8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  signOutBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E74C3C30',
    backgroundColor: '#E74C3C08',
  },
  signOutBtnPressed: { opacity: 0.7 },
  signOutBtnText: { fontSize: 16, fontWeight: '600', color: '#E74C3C' },
});
