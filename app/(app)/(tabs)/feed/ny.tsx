import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import { createPost } from '@/services/feed';
import { uploadHivePhoto } from '@/services/hive';

export default function NyttInnlegg() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createPost(content.trim(), imageUri ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Feil', e.message),
  });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const url = await uploadHivePhoto(result.assets[0].uri, `feed_${Date.now()}`);
        setImageUri(url);
      } catch (e) {
        Alert.alert('Bildeopplasting feilet', (e as Error).message);
      } finally {
        setUploading(false);
      }
    }
  }

  const canPost = content.trim().length >= 3 && !isPending && !uploading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Avbryt</Text>
        </Pressable>
        <Text style={styles.title}>Nytt innlegg</Text>
        <Pressable onPress={() => canPost && mutate()} disabled={!canPost} hitSlop={12}>
          <Text style={[styles.post, !canPost && styles.postDisabled]}>Publiser</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          style={styles.textArea}
          value={content}
          onChangeText={setContent}
          placeholder="Del en erfaring, tips eller spørsmål med birøkterfellesskapet..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          autoFocus
        />
        {imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
            <Pressable style={styles.removeImg} onPress={() => setImageUri(null)}>
              <Text style={styles.removeImgText}>✕</Text>
            </Pressable>
          </View>
        )}
        <Pressable style={styles.photoBtn} onPress={pickImage} disabled={uploading}>
          <Text style={styles.photoBtnText}>{uploading ? 'Laster opp...' : '📷 Legg til bilde'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mid + '15' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  cancel: { fontSize: 16, color: Colors.mid },
  post: { fontSize: 16, color: Colors.honey, fontWeight: '700' },
  postDisabled: { opacity: 0.4 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  textArea: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, fontSize: 15, color: Colors.dark, minHeight: 150, borderWidth: 1, borderColor: Colors.mid + '20', textAlignVertical: 'top' },
  imagePreview: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: 200 },
  removeImg: { position: 'absolute', top: 8, right: 8, backgroundColor: '#00000060', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  removeImgText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  photoBtn: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.mid + '20', borderStyle: 'dashed' },
  photoBtnText: { fontSize: 14, color: Colors.honey, fontWeight: '600' },
});
