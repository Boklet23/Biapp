import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AssociationCard } from '@/components/samfunn/AssociationCard';
import { SwarmMap } from '@/components/samfunn/SwarmMap';
import { Colors } from '@/constants/colors';
import { BEE_ASSOCIATIONS } from '@/constants/beeAssociations';

type Tab = 'kart' | 'lag';

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
              🗺 Svirm-kart
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'lag' && styles.tabActive]}
            onPress={() => setActiveTab('lag')}
          >
            <Text style={[styles.tabText, activeTab === 'lag' && styles.tabTextActive]}>
              🏛 Birøkterlag
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Innhold */}
      {activeTab === 'kart' ? (
        <SwarmMap />
      ) : (
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
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.mid },
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
});
