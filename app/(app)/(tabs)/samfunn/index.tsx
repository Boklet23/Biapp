import { lazy, Suspense, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { AssociationCard } from '@/components/samfunn/AssociationCard';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { fetchBeeAssociations, fetchEquipmentVendors } from '@/services/associations';

const SwarmMap = lazy(() =>
  import('@/components/samfunn/SwarmMap').then((m) => ({ default: m.SwarmMap }))
);

type Tab = 'kart' | 'lag' | 'utstyr';

const STALE_24H = 24 * 60 * 60 * 1000;
const GC_7D    =  7 * 24 * 60 * 60 * 1000;

export default function Samfunn() {
  const [activeTab, setActiveTab] = useState<Tab>('kart');
  const [lagQuery, setLagQuery] = useState('');
  const [svermQuery, setSvermQuery] = useState('');

  const { data: associations = [], isLoading: lagLoading } = useQuery({
    queryKey: ['bee-associations'],
    queryFn: fetchBeeAssociations,
    staleTime: 60 * 60 * 1000,
    gcTime: GC_7D,
  });

  const { data: vendors = [], isLoading: utstyrLoading } = useQuery({
    queryKey: ['equipment-vendors'],
    queryFn: fetchEquipmentVendors,
    staleTime: 60 * 60 * 1000,
    gcTime: GC_7D,
  });

  const filteredAssociations = useMemo(() => {
    if (!lagQuery.trim()) return associations;
    const q = lagQuery.toLowerCase();
    return associations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.county.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
    );
  }, [associations, lagQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header + tab-velger */}
      <View style={styles.header}>
        <Text style={styles.title}>Samfunn</Text>
        <View style={styles.tabs}>
          {(['kart', 'lag', 'utstyr'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'kart' ? '🐝 Sverm' : tab === 'lag' ? '🏛 Lag' : '🛒 Utstyr'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Sverm-kart */}
      {activeTab === 'kart' ? (
        <View style={styles.kartContainer}>
          <TextInput
            style={[styles.search, styles.searchKart]}
            value={svermQuery}
            onChangeText={setSvermQuery}
            placeholder="Søk i svermbeskrivelser..."
            placeholderTextColor={Colors.mid + '80'}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          <Suspense fallback={null}>
            <SwarmMap searchQuery={svermQuery} />
          </Suspense>
        </View>

      /* Lag-liste */
      ) : activeTab === 'lag' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.search}
            value={lagQuery}
            onChangeText={setLagQuery}
            placeholder="Søk på lag, fylke, e-post eller tlf..."
            placeholderTextColor={Colors.mid + '80'}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />

          {lagLoading ? (
            <ActivityIndicator color={Colors.honey} style={styles.loader} />
          ) : filteredAssociations.length === 0 ? (
            <Text style={styles.empty}>
              {lagQuery.trim() ? `Ingen treff for «${lagQuery}»` : 'Ingen lag funnet'}
            </Text>
          ) : (
            <>
              <Text style={styles.sub}>{filteredAssociations.length} birøkterlag</Text>
              {filteredAssociations.map((assoc) => (
                <AssociationCard key={assoc.id} association={assoc} />
              ))}
            </>
          )}
        </ScrollView>

      /* Utstyr-liste */
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {utstyrLoading ? (
            <ActivityIndicator color={Colors.honey} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.sub}>Norske forhandlere av birøkterutstyr</Text>
              {vendors.map((vendor) => (
                <Pressable
                  key={vendor.id}
                  style={({ pressed }) => [styles.vendorCard, pressed && { opacity: 0.75 }]}
                  onPress={() => Linking.openURL(vendor.website)}
                >
                  <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    {vendor.description && (
                      <Text style={styles.vendorDesc}>{vendor.description}</Text>
                    )}
                    {vendor.phone && (
                      <Pressable onPress={() => Linking.openURL(`tel:${vendor.phone}`)}>
                        <Text style={styles.vendorPhone}>📞 {vendor.phone}</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.vendorLink}>🌐</Text>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  kartContainer: { flex: 1 },
  searchKart: { margin: 12, marginBottom: 0 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '800', fontFamily: FontFamily.extrabold, color: Colors.dark, marginBottom: 12 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 3,
    marginBottom: 0,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.honey },
  tabText: { fontSize: 12, fontWeight: '600', fontFamily: FontFamily.semibold, color: Colors.mid },
  tabTextActive: { color: Colors.white },
  content: { padding: 16, paddingTop: 14, gap: 12, paddingBottom: 32 },
  sub: { fontSize: 13, color: Colors.mid, marginBottom: 2 },
  loader: { marginTop: 40 },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  empty: { fontSize: 14, color: Colors.mid, textAlign: 'center', marginTop: 12 },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vendorInfo: { flex: 1, gap: 3 },
  vendorName: { fontSize: 15, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
  vendorDesc: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.mid, lineHeight: 18 },
  vendorPhone: { fontSize: 13, color: Colors.honey, fontWeight: '600', marginTop: 2 },
  vendorLink: { fontSize: 22, marginLeft: 12 },
});
