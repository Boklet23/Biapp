import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { deletePost, fetchFeedPosts, toggleLike } from '@/services/feed';
import { FeedPost } from '@/types';
import { useAuthStore } from '@/store/auth';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}t siden`;
  const days = Math.floor(hours / 24);
  return `${days} dager siden`;
}

function PostCard({ post, currentUserId, onDelete }: { post: FeedPost; currentUserId?: string; onDelete: (id: string) => void }) {
  const queryClient = useQueryClient();

  const { mutate: like } = useMutation({
    mutationFn: () => toggleLike(post.id, post.likedByMe),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const handleLongPress = () => {
    if (post.userId !== currentUserId) return;
    Alert.alert('Slett innlegg', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => onDelete(post.id) },
    ]);
  };

  return (
    <Pressable style={styles.card} onLongPress={handleLongPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(post.authorName ?? 'B').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName ?? 'Birøkter'}</Text>
          <Text style={styles.timeAgo}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.cardFooter}>
        <Pressable style={styles.likeBtn} onPress={() => like()}>
          <Text style={[styles.likeIcon, post.likedByMe && styles.likedIcon]}>
            {post.likedByMe ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.likeCount}>{post.likes}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function Feed() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchFeedPosts(),
  });

  const { mutate: remove } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.honey} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Birøkterfellesskapet</Text>
          <Pressable style={styles.newBtn} onPress={() => router.push('/feed/ny' as any)}>
            <Text style={styles.newBtnText}>+ Del</Text>
          </Pressable>
        </View>
        <Text style={styles.sub}>Del erfaringer og bilder med norske birøktere</Text>

        {posts.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐝</Text>
            <Text style={styles.emptyText}>Ingen innlegg ennå</Text>
            <Text style={styles.emptySub}>Vær den første til å dele en erfaring!</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/feed/ny' as any)}>
              <Text style={styles.emptyBtnText}>Del noe</Text>
            </Pressable>
          </View>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={(profile as any)?.id}
            onDelete={remove}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  newBtn: { backgroundColor: Colors.honey, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  sub: { fontSize: 13, color: Colors.mid, marginTop: -6 },
  card: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', ...Shadows.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.honey + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.honey },
  authorInfo: { gap: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  timeAgo: { fontSize: 11, color: Colors.mid },
  content: { fontSize: 14, color: Colors.dark, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 10 },
  image: { width: '100%', height: 220 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.mid + '10' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 20 },
  likedIcon: {},
  likeCount: { fontSize: 14, fontWeight: '600', color: Colors.mid },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  emptySub: { fontSize: 13, color: Colors.mid },
  emptyBtn: { backgroundColor: Colors.honey, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
