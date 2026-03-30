import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { Hive } from '@/types';

interface HiveMapProps {
  hive: Hive;
}

const isExpoGo = Constants.appOwnership === 'expo';

// Conditional require — Mapbox throws at load time in Expo Go (no native code).
// Only require when NOT in Expo Go so the module evaluation doesn't crash.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mapboxLib = isExpoGo ? null : (require('@rnmapbox/maps') as typeof import('@rnmapbox/maps'));
if (mapboxLib) {
  mapboxLib.default.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');
}

export default function HiveMap({ hive }: HiveMapProps) {
  if (isExpoGo || !hive.locationLat || !hive.locationLng || !mapboxLib) return null;

  const { MapView, Camera, PointAnnotation } = mapboxLib;
  const Mapbox = mapboxLib.default;

  return (
    <View style={{ height: 160, borderRadius: 14, overflow: 'hidden', marginBottom: 4 }}>
      <MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        attributionPosition={{ bottom: 2, right: 4 }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Camera
          centerCoordinate={[hive.locationLng, hive.locationLat]}
          zoomLevel={13}
          animationDuration={0}
        />
        <PointAnnotation
          id="hive-location"
          coordinate={[hive.locationLng, hive.locationLat]}
        >
          <View style={{
            width: 32, height: 32,
            borderRadius: 16,
            backgroundColor: Colors.honey,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 16 }}>🏠</Text>
          </View>
        </PointAnnotation>
      </MapView>
    </View>
  );
}
