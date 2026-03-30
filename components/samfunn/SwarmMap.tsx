import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import Mapbox, { Camera, MapView, MarkerView, PointAnnotation } from '@rnmapbox/maps';
import { Colors } from '@/constants/colors';
import { fetchSwarmReports, createSwarmReport, SwarmReport } from '@/services/swarmReport';
import { useToastStore } from '@/store/toast';
import { ReportSwarmModal } from './ReportSwarmModal';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

const OSLO = { lat: 59.9139, lng: 10.7522 };

function daysSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'i dag';
  if (days === 1) return 'i går';
  if (days < 7) return `${days} dager siden`;
  return `${Math.floor(days / 7)} uker siden`;
}

export function SwarmMap() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<SwarmReport | null>(null);

  const { data: reports = [] } = useQuery({
    queryKey: ['swarm-reports'],
    queryFn: fetchSwarmReports,
  });

  const reportMutation = useMutation({
    mutationFn: (args: { description: string; contactInfo: string }) =>
      createSwarmReport({
        lat: userLocation?.lat ?? OSLO.lat,
        lng: userLocation?.lng ?? OSLO.lng,
        description: args.description || undefined,
        contactInfo: args.contactInfo || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swarm-reports'] });
      setModalVisible(false);
      showToast('Svirm rapportert!', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message ?? 'Kunne ikke sende rapport', 'error');
    },
  });

  const handleReportPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        showToast('Posisjon ikke tilgjengelig — rapporten plasseres ved Oslo', 'error');
      }
    } catch {
      showToast('Kunne ikke hente posisjon — rapporten plasseres ved Oslo', 'error');
    }
    setModalVisible(true);
  };

  const centerCoords: [number, number] = userLocation
    ? [userLocation.lng, userLocation.lat]
    : [OSLO.lng, OSLO.lat];

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} logoEnabled={false} attributionPosition={{ bottom: 4, right: 4 }}>
        <Camera centerCoordinate={centerCoords} zoomLevel={5} animationDuration={0} />

        {reports.map((report) => (
          <PointAnnotation
            key={report.id}
            id={report.id}
            coordinate={[report.lng, report.lat]}
            onSelected={() => setSelectedReport(report)}
          >
            <View style={styles.pin}>
              <Text style={styles.pinEmoji}>🐝</Text>
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {/* Valgt rapport callout */}
      {selectedReport && (
        <View style={styles.callout}>
          <Pressable style={styles.calloutClose} onPress={() => setSelectedReport(null)}>
            <Text style={styles.calloutCloseText}>✕</Text>
          </Pressable>
          <Text style={styles.calloutTitle}>Svirm rapportert {daysSince(selectedReport.reportedAt)}</Text>
          {selectedReport.description && (
            <Text style={styles.calloutDesc}>{selectedReport.description}</Text>
          )}
          {selectedReport.contactInfo && (
            <Text style={styles.calloutContact}>📞 {selectedReport.contactInfo}</Text>
          )}
        </View>
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleReportPress}
        accessibilityRole="button"
        accessibilityLabel="Rapporter svirm"
      >
        <Text style={styles.fabText}>+ Rapporter svirm</Text>
      </Pressable>

      <ReportSwarmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(description, contactInfo) => reportMutation.mutate({ description, contactInfo })}
        loading={reportMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pin: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinEmoji: { fontSize: 18 },
  callout: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 4,
  },
  calloutClose: { position: 'absolute', top: 12, right: 12, padding: 4 },
  calloutCloseText: { fontSize: 16, color: Colors.mid },
  calloutTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, paddingRight: 24 },
  calloutDesc: { fontSize: 14, color: Colors.mid, lineHeight: 20 },
  calloutContact: { fontSize: 13, color: Colors.honey, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: Colors.honey,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 28,
    shadowColor: Colors.honey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  fabText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
