import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Colors, Shadows } from '@/constants/colors';
import { deactivateListing, deleteListing, fetchListings } from '@/services/marketplace';
import { useAuthStore } from '@/store/auth';

const CAT_LABEL: Record<string, string> = {
  dronning: '👑 Dronning', avlegger: '🐝 Avlegger',
  utstyr: '🔧 Utstyr', honning: '🍯 Honning', annet: '📦 Annet',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ListingDetail() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ['listings', 'alle'],
    queryFn: () => fetchListings(),
  });

  const listing = listings.find((l) => l.id === listingId);

  const { mutate: markSold } = useMutation({
    mutationFn: () => deactivateListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      router.back();
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      router.back();
    },
  });

  if (!listing) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Annonse ikke funnet</Text>
        </View>
      </Screen>
    );
  }

  const isOwner = listing.userId === (profile as any)?.id;

  const handleContact = () => {
    if (!listing.contactInfo) return;
    const info = listing.contactInfo;
    if (info.includes('@')) {
      Linking.openURL(`mailto:${info}`).catch(() => null);
    } else {
      Linking.openURL(`tel:${info}`).catch(() => null);
    }
  };

  const handleOwnerActions = () => {
    Alert.alert('Administrer annonse', listing.title, [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Merk som solgt', onPress: () => markSold() },
      { text: 'Slett', style: 'destructive', onPress: () => remove() },
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.catRow}>
          <View style={styles.catChip}>
            <Text style={styles.catText}>{CAT_LABEL[listing.category] ?? listing.category}</Text>
          </View>
          <Text style={styles.date}>Publisert {formatDate(listing.createdAt)}</Text>
        </View>

        <Text style={styles.title}>{listing.title}</Text>

        {listing.price != null && (
          <Text style={styles.price}>{listing.price} {listing.priceUnit}</Text>
        )}

        {listing.description && (
          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Beskrivelse</Text>
            <Text style={styles.desc}>{listing.description}</Text>
          </View>
        )}

        <View style={styles.metaCard}>
          {listing.location && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
          )}
          {listing.sellerName && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>👤</Text>
              <Text style={styles.metaText}>{listing.sellerName}</Text>
            </View>
          )}
          {listing.contactInfo && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📬</Text>
              <Text style={styles.metaText}>{listing.contactInfo}</Text>
            </View>
          )}
        </View>

        {listing.contactInfo && !isOwner && (
          <Pressable style={styles.contactBtn} onPress={handleContact}>
            <Text style={styles.contactBtnText}>Kontakt selger</Text>
          </Pressable>
        )}

        {isOwner && (
          <Pressable style={styles.ownerBtn} onPress={handleOwnerActions}>
            <Text style={styles.ownerBtnText}>Administrer annonse</Text>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: Colors.mid },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catChip: { backgroundColor: Colors.honey + '18', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  catText: { fontSize: 13, color: Colors.honey, fontWeight: '600' },
  date: { fontSize: 12, color: Colors.mid },
  title: { fontSize: 24, fontWeight: '800', color: Colors.dark, lineHeight: 30 },
  price: { fontSize: 32, fontWeight: '800', color: Colors.dark },
  descCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 6, ...Shadows.card },
  descLabel: { fontSize: 12, fontWeight: '700', color: Colors.mid, textTransform: 'uppercase', letterSpacing: 0.6 },
  desc: { fontSize: 15, color: Colors.dark, lineHeight: 22 },
  metaCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12, ...Shadows.card },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: { fontSize: 18 },
  metaText: { fontSize: 14, color: Colors.dark },
  contactBtn: { backgroundColor: Colors.honey, borderRadius: 16, padding: 18, alignItems: 'center' },
  contactBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  ownerBtn: { backgroundColor: Colors.mid + '15', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.mid + '30' },
  ownerBtnText: { fontSize: 15, fontWeight: '600', color: Colors.mid },
});
