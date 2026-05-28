import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { Hive } from '@/types';

interface HiveMapProps {
  hive: Hive;
}

const isExpoGo = Constants.appOwnership === 'expo';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mapboxLib = isExpoGo ? null : (require('@rnmapbox/maps') as typeof import('@rnmapbox/maps'));
if (mapboxLib) {
  mapboxLib.default.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
}

const FLIGHT_RINGS = [
  { radius: 3000, color: '#F44336', label: '3 km' },
  { radius: 2000, color: '#FF9800', label: '2 km' },
  { radius: 1000, color: '#FFCA28', label: '1 km' },
  { radius:  500, color: '#4CAF50', label: '500 m' },
] as const;

function geoJsonCircle(lat: number, lng: number, radiusMeters: number): number[][] {
  const NUM_POINTS = 64;
  const coords: number[][] = [];
  for (let i = 0; i <= NUM_POINTS; i++) {
    const angle = (i / NUM_POINTS) * 2 * Math.PI;
    const dLat = (radiusMeters / 111320) * Math.cos(angle);
    const dLng = (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }
  return coords;
}

export default function HiveMap({ hive }: HiveMapProps) {
  if (hive.locationLat == null || hive.locationLng == null) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📍 Ingen posisjon registrert</Text>
      </View>
    );
  }

  if (isExpoGo || !mapboxLib) return null;

  const { MapView, Camera, PointAnnotation, ShapeSource, FillLayer, LineLayer } = mapboxLib as any;
  const Mapbox = mapboxLib.default;

  const lat = hive.locationLat;
  const lng = hive.locationLng;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          logoEnabled={false}
          attributionPosition={{ bottom: 2, right: 4 }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Camera
            centerCoordinate={[lng, lat]}
            zoomLevel={11}
            animationDuration={0}
          />

          {FLIGHT_RINGS.map(({ radius, color }) => {
            const coords = geoJsonCircle(lat, lng, radius);
            const shape = {
              type: 'Feature',
              geometry: { type: 'Polygon', coordinates: [coords] },
              properties: {},
            };
            return (
              <React.Fragment key={radius}>
                <ShapeSource id={`circle-src-${radius}`} shape={shape}>
                  <FillLayer
                    id={`circle-fill-${radius}`}
                    style={{ fillColor: color, fillOpacity: 0.12 }}
                  />
                  <LineLayer
                    id={`circle-line-${radius}`}
                    style={{ lineColor: color, lineWidth: 2, lineOpacity: 0.8 }}
                  />
                </ShapeSource>
              </React.Fragment>
            );
          })}

          <PointAnnotation id="hive-location" coordinate={[lng, lat]}>
            <View style={styles.markerPin}>
              <Text style={styles.markerEmoji}>🏠</Text>
            </View>
          </PointAnnotation>
        </MapView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[...FLIGHT_RINGS].reverse().map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.mid + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.mid,
    fontFamily: FontFamily.regular,
  },
  container: { marginBottom: 4 },
  mapWrap: { height: 220, borderRadius: 14, overflow: 'hidden' },
  map: { flex: 1 },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: { fontSize: 16 },
  legend: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 4,
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: Colors.mid,
  },
});
