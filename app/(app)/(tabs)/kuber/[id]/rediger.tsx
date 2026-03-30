import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { HiveTypeChip } from '@/components/hive/HiveTypeChip';
import { fetchHive, updateHive } from '@/services/hive';
import { HiveType } from '@/types';

const HIVE_TYPES: HiveType[] = ['langstroth', 'warre', 'toppstang', 'annet'];

export default function RedigerKube() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: hive } = useQuery({
    queryKey: ['hive', id],
    queryFn: () => fetchHive(id),
  });

  const [name, setName] = useState('');
  const [type, setType] = useState<HiveType>('langstroth');
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (hive && !initialized.current) {
      initialized.current = true;
      setName(hive.name);
      setType(hive.type);
      setLocationName(hive.locationName ?? '');
      setNotes(hive.notes ?? '');
    }
  }, [hive]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateHive>[1]) => updateHive(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hive', id] });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Navn er påkrevd');
      return;
    }
    setNameError('');
    mutation.mutate({
      name: name.trim(),
      type,
      locationName: locationName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {mutation.isError && (
          <Text style={styles.serverError}>
            Kunne ikke lagre endringer. Prøv igjen.
          </Text>
        )}

        <Input
          label="Navn på kube"
          value={name}
          onChangeText={(t) => { setName(t); setNameError(''); }}
          placeholder="f.eks. Kube 1 eller Epletreet"
          autoFocus
          error={nameError}
        />

        <Text style={styles.sectionLabel}>Kubetype</Text>
        <View style={styles.typeRow}>
          {HIVE_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeOption, type === t && styles.typeSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: type === t }}
            >
              <HiveTypeChip type={t} />
            </Pressable>
          ))}
        </View>

        <Input
          label="Sted (valgfritt)"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="f.eks. Hagen, Skogkanten"
        />

        <Input
          label="Notater (valgfritt)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Generelle notater om kuba"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        <Button
          label="Lagre endringer"
          onPress={handleSave}
          loading={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  scroll: { padding: 20, gap: 4, paddingBottom: 40 },
  serverError: {
    backgroundColor: '#FADBD8',
    color: Colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 10,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  typeSelected: {
    borderColor: Colors.honey,
  },
  notesInput: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
