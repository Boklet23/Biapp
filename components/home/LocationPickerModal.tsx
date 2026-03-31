import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '@/constants/colors';

export interface PickedLocation {
  lat: number;
  lng: number;
  name: string;
}

interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPick: (location: PickedLocation) => void;
}

async function reverseGeocode(lat: number, lng: number, token: string): Promise<string> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=no&types=place,locality,municipality&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    return json.features?.[0]?.place_name ?? `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}

async function forwardGeocode(query: string, token: string): Promise<SearchResult[]> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=NO&language=no&types=place,locality,municipality,region&limit=6`;
  const res = await fetch(url);
  const json = await res.json();
  return (json.features ?? []).map((f: Record<string, unknown>) => ({
    id: f.id as string,
    name: f.place_name as string,
    lat: (f.center as number[])[1],
    lng: (f.center as number[])[0],
  }));
}

export function LocationPickerModal({ visible, onClose, onPick }: LocationPickerModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await forwardGeocode(query, token);
      setResults(found);
      setSearching(false);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, token]);

  const handleGps = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Tillatelse nektet',
          'BiVokter trenger posisjonstilgang for å bruke GPS. Aktiver dette i telefoninnstillinger.',
        );
        setGpsLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = pos.coords;
      const name = await reverseGeocode(lat, lng, token);
      onPick({ lat, lng, name });
    } catch {
      Alert.alert('GPS-feil', 'Kunne ikke hente posisjon. Prøv å søk manuelt.');
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Velg værsted</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Lukk">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* GPS-knapp */}
          <Pressable
            style={({ pressed }) => [styles.gpsBtn, pressed && { opacity: 0.8 }, gpsLoading && styles.gpsBtnDisabled]}
            onPress={handleGps}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.gpsIcon}>📍</Text>
                <Text style={styles.gpsBtnText}>Bruk min posisjon (GPS)</Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>eller søk</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Søkefelt */}
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="By, sted eller kommune..."
            placeholderTextColor={Colors.mid + '80'}
            returnKeyType="search"
            autoFocus
            clearButtonMode="while-editing"
          />

          {/* Søkeresultater */}
          {searching && (
            <ActivityIndicator color={Colors.honey} style={{ marginTop: 16 }} />
          )}

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: Colors.amber }]}
                onPress={() => onPick({ lat: item.lat, lng: item.lng, name: item.name })}
              >
                <Text style={styles.resultIcon}>🌍</Text>
                <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              query.trim().length >= 2 && !searching ? (
                <Text style={styles.noResults}>Ingen treff for «{query}»</Text>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '18',
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.dark },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 18, color: Colors.mid },

  content: { flex: 1, padding: 20, gap: 16 },

  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.honey,
    borderRadius: 14,
    paddingVertical: 16,
  },
  gpsBtnDisabled: { opacity: 0.6 },
  gpsIcon: { fontSize: 20 },
  gpsBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.mid + '25' },
  dividerText: { fontSize: 13, color: Colors.mid },

  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },

  list: { flex: 1 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultIcon: { fontSize: 18 },
  resultName: { flex: 1, fontSize: 14, color: Colors.dark, lineHeight: 20 },
  noResults: { fontSize: 14, color: Colors.mid, textAlign: 'center', marginTop: 24 },
});
