import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { fetchMapHives } from '@/services/hive';
import { MapHiveEntry } from '@/types';

const isExpoGo = Constants.appOwnership === 'expo';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mapboxLib = isExpoGo ? null : (require('@rnmapbox/maps') as typeof import('@rnmapbox/maps'));
if (mapboxLib) {
  mapboxLib.default.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
}

const HIVE_TYPE_LABELS: Record<string, string> = {
  langstroth: 'Langstroth',
  warre: 'Warré',
  toppstang: 'Toppstangkube',
  annet: 'Annet',
};

function markerStyle(relationship: MapHiveEntry['relationship']): { bg: string; emoji: string } {
  if (relationship === 'own') return { bg: Colors.honey, emoji: '🏠' };
  if (relationship === 'team') return { bg: Colors.info, emoji: '🐝' };
  return { bg: Colors.success, emoji: '📍' };
}

export function HivesMapView() {
  const [selected, setSelected] = useState<MapHiveEntry | null>(null);

  const { data: hives = [], isLoading } = useQuery({
    queryKey: ['map-hives'],
    queryFn: fetchMapHives,
    staleTime: 5 * 60 * 1000,
  });

  if (isExpoGo) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyTitle}>Kart ikke tilgjengelig i Expo Go</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={Colors.honey} />
      </View>
    );
  }

  if (hives.length === 0) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.emptyEmoji}>📍</Text>
        <Text style={styles.emptyTitle}>Ingen kuber har GPS-posisjon ennå</Text>
        <Text style={styles.emptyText}>Rediger en kube og trykk «Bruk min posisjon»</Text>
      </View>
    );
  }

  const MapboxGL = mapboxLib!.default;
  const { Camera, MapView, PointAnnotation } = mapboxLib!;

  let cameraProps: Record<string, unknown>;
  if (hives.length === 1) {
    cameraProps = {
      centerCoordinate: [hives[0].locationLng, hives[0].locationLat],
      zoomLevel: 13,
    };
  } else {
    const lats = hives.map((h) => h.locationLat);
    const lngs = hives.map((h) => h.locationLng);
    cameraProps = {
      bounds: {
        ne: [Math.max(...lngs), Math.max(...lats)],
        sw: [Math.min(...lngs), Math.min(...lats)],
        paddingLeft: 60,
        paddingRight: 60,
        paddingTop: 80,
        paddingBottom: 80,
      },
    };
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} logoEnabled={false} attributionEnabled={false}>
        <Camera animationDuration={0} {...(cameraProps as any)} />
        {hives.map((h) => {
          const { bg, emoji } = markerStyle(h.relationship);
          return (
            <PointAnnotation
              key={h.id}
              id={h.id}
              coordinate={[h.locationLng, h.locationLat]}
              onSelected={() => setSelected(h)}
            >
              <View style={[styles.pin, { backgroundColor: bg }]}>
                <Text style={styles.pinEmoji}>{emoji}</Text>
              </View>
            </PointAnnotation>
          );
        })}
      </MapView>

      {selected && (
        <Pressable style={styles.calloutOverlay} onPress={() => setSelected(null)}>
          <View style={styles.callout}>
            <Pressable onPress={() => setSelected(null)} style={styles.calloutClose}>
              <Text style={styles.calloutCloseText}>✕</Text>
            </Pressable>
            <Text style={styles.calloutName}>{selected.name}</Text>
            <Text style={styles.calloutType}>{HIVE_TYPE_LABELS[selected.type] ?? selected.type}</Text>
            {selected.relationship !== 'own' && (
              <Text style={styles.calloutOwner}>Eier: {selected.ownerName}</Text>
            )}
            {selected.locationName ? (
              <Text style={styles.calloutLocation}>📍 {selected.locationName}</Text>
            ) : null}
            {selected.relationship === 'own' && (
              <Pressable
                style={({ pressed }) => [styles.calloutBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  setSelected(null);
                  router.push({ pathname: '/kuber/[id]' as any, params: { id: selected.id } });
                }}
              >
                <Text style={styles.calloutBtnText}>Åpne kube →</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.honey }]} />
          <Text style={styles.legendLabel}>Mine</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
          <Text style={styles.legendLabel}>Lag</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendLabel}>Delt</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.dark,
    padding: 32,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.white, textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: FontFamily.regular, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  pin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinEmoji: { fontSize: 18 },
  calloutOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  callout: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 4,
  },
  calloutClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  calloutCloseText: { fontSize: 16, color: Colors.muted },
  calloutName: { fontSize: 18, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark, marginRight: 28 },
  calloutType: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.mid },
  calloutOwner: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.mid, marginTop: 2 },
  calloutLocation: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.mid, marginTop: 2 },
  calloutBtn: {
    marginTop: 12,
    backgroundColor: Colors.honey,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  calloutBtnText: { fontSize: 14, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
  legend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontFamily: FontFamily.semibold, color: Colors.white, fontWeight: '600' },
});
