import { lazy, Suspense, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AssociationCard } from '@/components/samfunn/AssociationCard';
import { Colors } from '@/constants/colors';
import { BEE_ASSOCIATIONS } from '@/constants/beeAssociations';
import { BEE_EQUIPMENT_VENDORS } from '@/constants/beeEquipmentVendors';

const SwarmMap = lazy(() =>
  import('@/components/samfunn/SwarmMap').then((m) => ({ default: m.SwarmMap }))
);

type Tab = 'kart' | 'lag' | 'utstyr';

export default function Samfunn() {
  const [activeTab, setActiveTab] = useState<Tab>('kart');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return BEE_ASSOCIATIONS;
    const q = query.toLowerCase();
    return BEE_ASSOCIATIONS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.county.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header + tab-velger */}
      <View style={styles.header}>
        <Text style={styles.title}>Samfunn</Text>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'kart' && styles.tabActive]}
            onPress={() => setActiveTab('kart')}
          >
            <Text style={[styles.tabText, activeTab === 'kart' && styles.tabTextActive]}>
              🗺 Svirm
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'lag' && styles.tabActive]}
            onPress={() => setActiveTab('lag')}
          >
            <Text style={[styles.tabText, activeTab === 'lag' && styles.tabTextActive]}>
              🏛 Lag
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'utstyr' && styles.tabActive]}
            onPress={() => setActiveTab('utstyr')}
          >
            <Text style={[styles.tabText, activeTab === 'utstyr' && styles.tabTextActive]}>
              🛒 Utstyr
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Innhold */}
      {activeTab === 'kart' ? (
        <Suspense fallback={null}>
          <SwarmMap />
        </Suspense>
      ) : activeTab === 'lag' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sub}>Norske birøkterlag</Text>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Søk på lag eller fylke..."
            placeholderTextColor={Colors.mid + '80'}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {filtered.length === 0 ? (
            <Text style={styles.empty}>Ingen treff for «{query}»</Text>
          ) : (
            filtered.map((assoc) => (
              <AssociationCard key={assoc.id} association={assoc} />
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sub}>Norske forhandlere av birøkterutstyr</Text>
          {BEE_EQUIPMENT_VENDORS.map((vendor) => (
            <Pressable
              key={vendor.id}
              style={({ pressed }) => [styles.vendorCard, pressed && { opacity: 0.75 }]}
              onPress={() => Linking.openURL(vendor.website)}
            >
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorDesc}>{vendor.description}</Text>
              </View>
              <Text style={styles.vendorLink}>🌐</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark, marginBottom: 12 },
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
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: Colors.honey },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.mid },
  tabTextActive: { color: Colors.white },
  content: { padding: 16, paddingTop: 14, gap: 12, paddingBottom: 32 },
  sub: { fontSize: 14, color: Colors.mid, marginBottom: 2 },
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
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  vendorDesc: { fontSize: 13, color: Colors.mid, lineHeight: 18 },
  vendorLink: { fontSize: 22, marginLeft: 12 },
});
