import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import { createListing } from '@/services/marketplace';
import { MarketplaceListing } from '@/types';

const CATEGORIES: { value: MarketplaceListing['category']; label: string }[] = [
  { value: 'dronning', label: '👑 Dronning' },
  { value: 'avlegger', label: '🐝 Avlegger' },
  { value: 'utstyr', label: '🔧 Utstyr' },
  { value: 'honning', label: '🍯 Honning' },
  { value: 'annet', label: '📦 Annet' },
];

export default function NyAnnonse() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketplaceListing['category']>('dronning');
  const [priceStr, setPriceStr] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => createListing({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      price: priceStr ? parseFloat(priceStr.replace(',', '.')) : undefined,
      location: location.trim() || undefined,
      contactInfo: contact.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  const canSave = title.trim().length >= 3 && !isPending;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Avbryt</Text>
        </Pressable>
        <Text style={styles.title}>Ny annonse</Text>
        <Pressable onPress={() => canSave && mutate()} disabled={!canSave} hitSlop={12}>
          <Text style={[styles.save, !canSave && styles.saveDisabled]}>Publiser</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Tittel *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="f.eks. Buckfast-dronning 2025" />

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              style={[styles.catChip, category === cat.value && styles.catChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text style={[styles.catText, category === cat.value && styles.catTextActive]}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Beskrivelse</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription}
          placeholder="Beskrivelse av hva du selger..." multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles.label}>Pris (kr, valgfritt)</Text>
        <TextInput style={styles.input} value={priceStr} onChangeText={setPriceStr}
          placeholder="f.eks. 250" keyboardType="decimal-pad" />

        <Text style={styles.label}>Sted</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="f.eks. Østfold" />

        <Text style={styles.label}>Kontaktinfo</Text>
        <TextInput style={styles.input} value={contact} onChangeText={setContact}
          placeholder="Telefon eller e-post" keyboardType="email-address" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mid + '15' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cancel: { fontSize: 16, color: Colors.mid },
  save: { fontSize: 16, color: Colors.honey, fontWeight: '700' },
  saveDisabled: { opacity: 0.4 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.dark, borderWidth: 1, borderColor: Colors.mid + '20' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.mid + '30' },
  catChipActive: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  catText: { fontSize: 13, color: Colors.mid, fontWeight: '500' },
  catTextActive: { color: Colors.white, fontWeight: '700' },
});
