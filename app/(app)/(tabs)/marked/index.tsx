import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { deactivateListing, deleteListing, fetchListings, fetchMyListings } from '@/services/marketplace';
import { MarketplaceListing } from '@/types';
import { useAuthStore } from '@/store/auth';

const CATEGORIES = ['alle', 'dronning', 'avlegger', 'utstyr', 'honning', 'annet'];
const CAT_LABEL: Record<string, string> = {
  alle: '🔍 Alle', dronning: '👑 Dronning', avlegger: '🐝 Avlegger',
  utstyr: '🔧 Utstyr', honning: '🍯 Honning', annet: '📦 Annet',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ListingCard({ item, isOwner, onLongPress }: { item: MarketplaceListing; isOwner: boolean; onLongPress?: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/marked/[listingId]', params: { listingId: item.id } } as any)}
      onLongPress={onLongPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.catChip}>
          <Text style={styles.catText}>{CAT_LABEL[item.category] ?? item.category}</Text>
        </View>
        {item.price != null && (
          <Text style={styles.price}>{item.price} {item.priceUnit}</Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
      <View style={styles.cardFooter}>
        {item.location && <Text style={styles.meta}>📍 {item.location}</Text>}
        <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
        {item.sellerName && <Text style={styles.meta}>👤 {item.sellerName}</Text>}
      </View>
      {isOwner && <View style={styles.ownerBadge}><Text style={styles.ownerBadgeText}>Min annonse</Text></View>}
    </Pressable>
  );
}

export default function Marked() {
  const [category, setCategory] = useState('alle');
  const [showMine, setShowMine] = useState(false);
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings', category],
    queryFn: () => fetchListings(category),
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  });

  const { mutate: markSold } = useMutation({
    mutationFn: deactivateListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const handleLongPress = (item: MarketplaceListing) => {
    Alert.alert('Administrer annonse', item.title, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Merk som solgt', onPress: () => markSold(item.id) },
      { text: 'Slett', style: 'destructive', onPress: () => remove(item.id) },
    ]);
  };

  const displayed = showMine ? myListings : listings;

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Markedsplass</Text>
          <Pressable style={styles.newBtn} onPress={() => router.push('/marked/ny' as any)}>
            <Text style={styles.newBtnText}>+ Ny annonse</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, !showMine && styles.tabActive]} onPress={() => setShowMine(false)}>
            <Text style={[styles.tabText, !showMine && styles.tabTextActive]}>Alle annonser</Text>
          </Pressable>
          <Pressable style={[styles.tab, showMine && styles.tabActive]} onPress={() => setShowMine(true)}>
            <Text style={[styles.tabText, showMine && styles.tabTextActive]}>Mine annonser</Text>
          </Pressable>
        </View>

        {/* Category filter */}
        {!showMine && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.catChipFilter, category === cat && styles.catChipFilterActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipFilterText, category === cat && styles.catChipFilterTextActive]}>
                  {CAT_LABEL[cat]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {isLoading && <Text style={styles.loading}>Laster annonser...</Text>}

        {displayed.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>
              {showMine ? 'Du har ingen aktive annonser' : 'Ingen annonser funnet'}
            </Text>
            {showMine && (
              <Pressable style={styles.emptyBtn} onPress={() => router.push('/marked/ny' as any)}>
                <Text style={styles.emptyBtnText}>Legg ut din første annonse</Text>
              </Pressable>
            )}
          </View>
        )}

        {displayed.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            isOwner={item.userId === (profile as any)?.id}
            onLongPress={item.userId === (profile as any)?.id ? () => handleLongPress(item) : undefined}
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
  tabs: { flexDirection: 'row', backgroundColor: Colors.mid + '15', borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.white, ...Shadows.card },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.mid },
  tabTextActive: { color: Colors.dark },
  catRow: { gap: 8, paddingBottom: 4 },
  catChipFilter: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.mid + '30' },
  catChipFilterActive: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  catChipFilterText: { fontSize: 13, color: Colors.mid, fontWeight: '500' },
  catChipFilterTextActive: { color: Colors.white, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 8, ...Shadows.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catChip: { backgroundColor: Colors.honey + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 12, color: Colors.honey, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '800', color: Colors.dark },
  title: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  desc: { fontSize: 13, color: Colors.mid, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { fontSize: 12, color: Colors.mid },
  ownerBadge: { backgroundColor: Colors.info + '18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  ownerBadgeText: { fontSize: 11, color: Colors.info, fontWeight: '700' },
  loading: { fontSize: 14, color: Colors.mid, textAlign: 'center', paddingVertical: 20 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, color: Colors.mid, fontWeight: '600' },
  emptyBtn: { backgroundColor: Colors.honey, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
