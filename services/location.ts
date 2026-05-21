import * as Location from 'expo-location';

export interface DeviceLocation {
  lat: number;
  lng: number;
  placeName: string | null;
}

export async function getDeviceLocation(): Promise<DeviceLocation> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) throw new Error('SERVICES_DISABLED');

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('PERMISSION_DENIED');

  // Fast path: use cached position if < 5 min old
  let pos = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });

  if (!pos) {
    pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      ),
    ]);
  }

  let placeName: string | null = null;
  try {
    const [place] = await Location.reverseGeocodeAsync(pos.coords);
    if (place) {
      placeName =
        [place.city ?? place.subregion, place.region].filter(Boolean).join(', ') || null;
    }
  } catch {
    // Coordinates were obtained — place name is non-critical
  }

  return { lat: pos.coords.latitude, lng: pos.coords.longitude, placeName };
}

export function locationErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (msg === 'SERVICES_DISABLED') return 'Slå på stedstjenester i telefoninnstillingene og prøv igjen.';
  if (msg === 'PERMISSION_DENIED') return 'GPS-tillatelse nektet. Gi tilgang i Innstillinger.';
  if (msg === 'TIMEOUT') return 'GPS brukte for lang tid. Gå utendørs og prøv igjen.';
  return 'Kunne ikke hente posisjon. Prøv igjen.';
}
